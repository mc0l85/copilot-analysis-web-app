
import { NextRequest, NextResponse } from 'next/server'
import { analysisResults } from '@/lib/analysis-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    console.log('Deep dive API called with sessionId:', sessionId)
    
    if (!sessionId) {
      console.log('No sessionId provided')
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    let results = analysisResults.get(sessionId)
    console.log('Results found:', !!results)
    
    if (!results) {
      console.log('Session not found in analysisResults')
      console.log('Available sessions:', Array.from(analysisResults.keys()))
      
      // Try to create test results if the session is the test session
      if (sessionId === 'test-session-123') {
        console.log('Creating test results for test session')
        const { createTestResults } = await import('@/lib/analysis-store')
        const testResults = createTestResults()
        results = testResults
      }
      
      if (!results) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
    }
    
    // Check if we have detailed user data from the Python backend
    if (!results.detailed_users || results.detailed_users.length === 0) {
      console.log('No detailed user data available')
      return NextResponse.json({ error: 'No detailed user data available' }, { status: 404 })
    }
    
    // Use the real detailed user data from the Python backend
    const detailedUsers = results.detailed_users
    console.log('Returning', detailedUsers.length, 'users')
    
    return NextResponse.json({
      status: 'success',
      users: detailedUsers,
      summary: results.summary
    })
  } catch (error) {
    console.error('Deep dive API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deep dive data' },
      { status: 500 }
    )
  }
}



export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const { selectedUsers } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    const results = analysisResults.get(sessionId)
    if (!results) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    // Check if we have detailed user data
    if (!results.detailed_users || results.detailed_users.length === 0) {
      return NextResponse.json({ error: 'No detailed user data available' }, { status: 404 })
    }
    
    // Generate comparison data for selected users using real data
    const comparisonData = generateComparisonData(selectedUsers, results.detailed_users)
    
    return NextResponse.json({
      status: 'success',
      comparison: comparisonData
    })
  } catch (error) {
    console.error('Deep dive comparison API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate comparison data' },
      { status: 500 }
    )
  }
}

function generateComparisonData(selectedUsers: string[], allUsers: any[]) {
  if (selectedUsers.length === 0) {
    return {
      averageEngagement: 0,
      totalToolsUsed: 0,
      commonTools: [],
      trendAnalysis: {
        increasing: 0,
        stable: 0,
        decreasing: 0
      },
      riskDistribution: {
        low: 0,
        medium: 0,
        high: 0
      }
    }
  }
  
  // Filter to only selected users
  const selectedUserData = allUsers.filter(user => selectedUsers.includes(user.email))
  
  // Calculate average engagement
  const averageEngagement = selectedUserData.length > 0 
    ? selectedUserData.reduce((sum, user) => sum + (user.engagementScore || 0), 0) / selectedUserData.length
    : 0
  
  // Calculate total unique tools used
  const allToolsUsed = new Set<string>()
  selectedUserData.forEach(user => {
    if (user.toolsUsed && Array.isArray(user.toolsUsed)) {
      user.toolsUsed.forEach((tool: string) => allToolsUsed.add(tool))
    }
  })
  
  // Find common tools (tools used by at least 50% of selected users)
  const toolCounts: { [key: string]: number } = {}
  selectedUserData.forEach(user => {
    if (user.toolsUsed && Array.isArray(user.toolsUsed)) {
      user.toolsUsed.forEach((tool: string) => {
        toolCounts[tool] = (toolCounts[tool] || 0) + 1
      })
    }
  })
  
  const commonTools = Object.keys(toolCounts).filter((tool: string) => 
    toolCounts[tool] >= Math.max(1, Math.floor(selectedUserData.length * 0.5))
  )
  
  // Calculate trend analysis
  const trendCounts = {
    increasing: 0,
    stable: 0,
    decreasing: 0
  }
  
  selectedUserData.forEach(user => {
    const trend = (user.trend || 'N/A').toLowerCase()
    if (trend === 'increasing') trendCounts.increasing++
    else if (trend === 'stable') trendCounts.stable++
    else if (trend === 'decreasing') trendCounts.decreasing++
  })
  
  // Calculate risk distribution
  const riskCounts = {
    low: 0,
    medium: 0,
    high: 0
  }
  
  selectedUserData.forEach(user => {
    const risk = (user.riskLevel || 'low').toLowerCase()
    if (risk === 'low') riskCounts.low++
    else if (risk === 'medium') riskCounts.medium++
    else if (risk === 'high') riskCounts.high++
  })
  
  return {
    averageEngagement: Math.round(averageEngagement * 100) / 100,
    totalToolsUsed: allToolsUsed.size,
    commonTools,
    trendAnalysis: trendCounts,
    riskDistribution: riskCounts
  }
}
