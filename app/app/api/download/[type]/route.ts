
import { NextRequest, NextResponse } from 'next/server'
import { readFile, readdir, stat } from 'fs/promises'
import { analysisResults } from '@/lib/analysis-store'
import path from 'path'

async function findMostRecentAnalysis() {
  try {
    const tempDir = path.join(process.cwd(), 'temp')
    const entries = await readdir(tempDir)
    
    let mostRecentDir = null
    let mostRecentTime = 0
    
    for (const entry of entries) {
      const fullPath = path.join(tempDir, entry)
      const stats = await stat(fullPath)
      
      if (stats.isDirectory() && stats.mtime.getTime() > mostRecentTime) {
        // Check if this directory has output files
        const outputDir = path.join(fullPath, 'output')
        try {
          const outputFiles = await readdir(outputDir)
          const hasExcel = outputFiles.some(file => file.endsWith('.xlsx'))
          const hasHtml = outputFiles.some(file => file.endsWith('.html'))
          
          if (hasExcel && hasHtml) {
            mostRecentTime = stats.mtime.getTime()
            mostRecentDir = fullPath
          }
        } catch (e) {
          // Skip directories without output
          continue
        }
      }
    }
    
    if (mostRecentDir) {
      const outputDir = path.join(mostRecentDir, 'output')
      const outputFiles = await readdir(outputDir)
      
      const excelFile = outputFiles.find(file => file.endsWith('.xlsx'))
      const htmlFile = outputFiles.find(file => file.endsWith('.html'))
      
      if (excelFile && htmlFile) {
        return {
          files: {
            excel: path.join(outputDir, excelFile),
            html: path.join(outputDir, htmlFile)
          }
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error finding recent analysis:', error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params
    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')
    
    // Get the result by sessionId or the most recent one
    let result
    if (sessionId) {
      result = await analysisResults.get(sessionId)
    } else {
      // Get the most recent result from memory
      const allKeys = await analysisResults.getAllKeys()
      if (allKeys.length > 0) {
        const mostRecentKey = allKeys[allKeys.length - 1]
        result = await analysisResults.get(mostRecentKey)
      }
    }
    
    // If no result found in memory, try to find from file system
    if (!result) {
      console.log('No results in memory, searching file system...')
      result = await findMostRecentAnalysis()
      
      if (!result) {
        return NextResponse.json(
          { error: 'No analysis results found' },
          { status: 404 }
        )
      }
    }
    
    let filePath: string
    let contentType: string
    let filename: string
    
    if (type === 'excel') {
      filePath = result.files.excel
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      filename = 'copilot_analysis.xlsx'
    } else if (type === 'html') {
      filePath = result.files.html
      contentType = 'text/html'
      filename = 'leaderboard.html'
    } else if (type === 'leaderboard') {
      filePath = result.files.html
      contentType = 'text/html'
      filename = 'leaderboard.html'
    } else {
      return NextResponse.json(
        { error: 'Invalid download type' },
        { status: 400 }
      )
    }
    
    // Check if file exists and read it
    try {
      const file = await readFile(filePath)
      
      const headers: Record<string, string> = {
        'Content-Type': contentType
      }
      
      // Add download disposition for excel and html downloads (not for leaderboard viewing)
      if (type !== 'leaderboard') {
        headers['Content-Disposition'] = `attachment; filename="${filename}"`
      }
      
      return new NextResponse(file, { headers })
    } catch (fileError) {
      console.error('File read error:', fileError)
      return NextResponse.json(
        { error: 'File not found or could not be read' },
        { status: 404 }
      )
    }
    
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    )
  }
}
