
import { NextRequest, NextResponse } from 'next/server'
import { analysisResults } from '@/lib/analysis-store'

export async function GET(request: NextRequest) {
  try {
    const sessions = Array.from(analysisResults.keys())
    const sessionData: { [key: string]: any } = {}
    
    for (const sessionId of sessions) {
      const data = analysisResults.get(sessionId)
      sessionData[sessionId] = {
        hasResults: !!data,
        hasDetailedUsers: !!(data?.detailed_users),
        detailedUsersCount: data?.detailed_users?.length || 0,
        summary: data?.summary,
        keys: data ? Object.keys(data) : []
      }
    }
    
    return NextResponse.json({
      totalSessions: sessions.length,
      sessions: sessions,
      sessionData: sessionData
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: 'Failed to get debug data' },
      { status: 500 }
    )
  }
}
