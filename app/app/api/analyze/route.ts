import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { spawn } from 'child_process'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { analysisResults } from '@/lib/analysis-store'

// Server-safe type guard for file-like objects
const isFileLike = (val: any): val is { arrayBuffer: () => Promise<ArrayBuffer>; name?: string; size?: number } =>
  val && typeof val === 'object' && typeof val.arrayBuffer === 'function';

// Helper function to validate and parse JSON safely
const safeJsonParse = (text: string): any => {
  try {
    // Trim whitespace and check if the string looks like JSON
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Empty string provided for JSON parsing');
    }
    
    // Basic validation - JSON should start with { or [
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      throw new Error(`Invalid JSON format. Text starts with: "${trimmed.substring(0, 20)}..."`);
    }
    
    return JSON.parse(trimmed);
  } catch (error) {
    throw new Error(`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}. Input: "${text.substring(0, 100)}..."`);
  }
};

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
    
    // Parse results with improved error handling
    console.log('Python script output:', result)
    
    const lines = result.trim().split('\n')
    const lastLine = lines[lines.length - 1]
    
    console.log('Last line from Python output:', lastLine)
    
    // Find the last valid JSON line (in case there are multiple lines)
    let analysisResult: any = null
    let jsonParseError: string | null = null
    
    // Try parsing from the last line backwards to find valid JSON
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (line && (line.startsWith('{') || line.startsWith('['))) {
        try {
          analysisResult = safeJsonParse(line)
          console.log('Successfully parsed JSON from line:', i + 1)
          break
        } catch (error) {
          jsonParseError = error instanceof Error ? error.message : 'Unknown JSON parse error'
          console.log(`Failed to parse line ${i + 1}:`, error)
          continue
        }
      }
    }
    
    // If no valid JSON was found, throw an error with helpful information
    if (!analysisResult) {
      const errorMessage = jsonParseError 
        ? `No valid JSON found in Python output. Last parse error: ${jsonParseError}`
        : 'No valid JSON found in Python output. Output may contain only non-JSON text.';
      
      console.error('Python output analysis failed:', {
        totalLines: lines.length,
        lastLine,
        fullOutput: result.substring(0, 500) + (result.length > 500 ? '...' : '')
      })
      
      throw new Error(`${errorMessage} Full output: ${result.substring(0, 200)}...`)
    }
    
    if (analysisResult.status === 'error') {
      throw new Error(analysisResult.message)
    }
    
    // Store results with session ID using the new async interface
    const sessionData = {
      ...analysisResult,
      tempDir,
      filePaths,
      sessionId
    }
    
    console.log(`Storing analysis results for session ${sessionId}`)
    await analysisResults.set(sessionId, sessionData)
    console.log(`Session ${sessionId} stored successfully`)
    
    // Schedule cleanup after 5 minutes
    setTimeout(async () => {
      try {
        console.log(`Starting cleanup for session ${sessionId}`)
        const resultData = await analysisResults.get(sessionId)
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
          
          await analysisResults.delete(sessionId)
          console.log(`Session ${sessionId} cleaned up successfully`)
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
