
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { analysisResults } from '@/lib/analysis-store'

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
      result = analysisResults.get(sessionId)
    } else {
      // Get the most recent result
      const allResults = Array.from(analysisResults.values())
      result = allResults[allResults.length - 1]
    }
    
    if (!result) {
      return NextResponse.json(
        { error: 'No analysis results found' },
        { status: 404 }
      )
    }
    
    if (type === 'excel') {
      const filePath = result.files.excel
      const file = await readFile(filePath)
      
      return new NextResponse(file, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="copilot_analysis.xlsx"`
        }
      })
    } else if (type === 'html') {
      const filePath = result.files.html
      const file = await readFile(filePath)
      
      return new NextResponse(file, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="leaderboard.html"`
        }
      })
    } else if (type === 'leaderboard') {
      const filePath = result.files.html
      const file = await readFile(filePath)
      
      return new NextResponse(file, {
        headers: {
          'Content-Type': 'text/html'
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid download type' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    )
  }
}
