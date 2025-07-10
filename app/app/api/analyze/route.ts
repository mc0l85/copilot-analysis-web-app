import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { spawn } from 'child_process'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { analysisResults } from '@/lib/analysis-store'

// Server-safe type guard for file-like objects
const isFileLike = (val: any): val is { arrayBuffer: () => Promise<ArrayBuffer>; name?: string; size?: number } =>
  val && typeof val === 'object' && typeof val.arrayBuffer === 'function';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const sessionId = uuidv4()
    
    // Create temporary directory
    const tempDir = path.join(process.cwd(), 'temp', sessionId)
    await mkdir(tempDir, { recursive: true })
    
    // Process uploaded files - remove explicit File type annotation
    const targetUsersFile = formData.get('targetUsersFile')
    const filters = JSON.parse(formData.get('filters') as string || '{}')
    
    const filePaths: string[] = []
    const usageReportPaths: string[] = []
    
    // Save target users file if provided
    let targetUsersPath = ''
    if (targetUsersFile && isFileLike(targetUsersFile) && (targetUsersFile.size || 0) > 0) {
      const targetUsersBuffer = Buffer.from(await targetUsersFile.arrayBuffer())
      targetUsersPath = path.join(tempDir, 'target_users.csv')
      await writeFile(targetUsersPath, targetUsersBuffer)
      filePaths.push(targetUsersPath)
    }
    
    // Save usage report files - use more generic type
    const usageReportFiles: any[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('usageReportFile_') && isFileLike(value)) {
        usageReportFiles.push(value)
      }
    }
    
    for (let i = 0; i < usageReportFiles.length; i++) {
      const file = usageReportFiles[i]
      const buffer = Buffer.from(await file.arrayBuffer())
      const extension = file.name?.split('.').pop() || 'csv'
      const filePath = path.join(tempDir, `usage_report_${i}.${extension}`)
      await writeFile(filePath, buffer)
      usageReportPaths.push(filePath)
      filePaths.push(filePath)
    }
    
    // Create output directory
    const outputDir = path.join(tempDir, 'output')
    await mkdir(outputDir, { recursive: true })
    
    // Build Python command
    const pythonScript = path.join(process.cwd(), 'python_backend', 'copilot_analyzer.py')
    const args = [
      pythonScript,
      '--usage-reports',
      ...usageReportPaths,
      '--output-dir',
      outputDir
    ]
    
    if (targetUsersPath) {
      args.push('--target-users', targetUsersPath)
    }
    
    if (Object.keys(filters).length > 0) {
      args.push('--filters', JSON.stringify(filters))
    }
    
    // Execute Python script
    const result = await new Promise<string>((resolve, reject) => {
      const pythonProcess = spawn('python3', args)
      
      let stdout = ''
      let stderr = ''
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(stdout)
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`))
        }
      })
      
      pythonProcess.on('error', (error) => {
        reject(error)
      })
    })
    
    // Parse results
    const lines = result.trim().split('\n')
    const lastLine = lines[lines.length - 1]
    const analysisResult = JSON.parse(lastLine)
    
    if (analysisResult.status === 'error') {
      throw new Error(analysisResult.message)
    }
    
    // Store results with session ID
    analysisResults.set(sessionId, {
      ...analysisResult,
      tempDir,
      filePaths,
      sessionId
    })
    
    // Schedule cleanup after 5 minutes
    setTimeout(async () => {
      try {
        const resultData = analysisResults.get(sessionId)
        if (resultData) {
          // Clean up files
          for (const filePath of resultData.filePaths) {
            try {
              await unlink(filePath)
            } catch (e) {
              console.error('Error deleting file:', e)
            }
          }
          
          // Clean up output files
          try {
            await unlink(resultData.files.excel)
          } catch (e) {
            console.error('Error deleting Excel file:', e)
          }
          
          try {
            await unlink(resultData.files.html)
          } catch (e) {
            console.error('Error deleting HTML file:', e)
          }
          
          analysisResults.delete(sessionId)
        }
      } catch (error) {
        console.error('Cleanup error:', error)
      }
    }, 5 * 60 * 1000) // 5 minutes
    
    return NextResponse.json({
      ...analysisResult,
      sessionId
    })
    
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Analysis failed' 
      },
      { status: 500 }
    )
  }
}
