
import { NextRequest, NextResponse } from 'next/server'
import { analysisResults } from '@/lib/analysis-store'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    const results = analysisResults.get(sessionId)
    if (!results) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    // For now, generate mock detailed user data based on the summary
    // In a real implementation, this would come from the Python backend
    const detailedUsers = generateMockUserData(results.summary)
    
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

function generateMockUserData(summary: any) {
  const users = []
  
  // Generate Top Utilizers
  for (let i = 0; i < summary.top_utilizers; i++) {
    users.push({
      email: `user${i + 1}@company.com`,
      classification: 'Top Utilizer',
      engagementScore: 2.5 + Math.random() * 0.5,
      consistencyPercent: 75 + Math.random() * 25,
      complexityScore: 8 + Math.random() * 4,
      avgToolsPerReport: 3 + Math.random() * 2,
      trend: ['Increasing', 'Stable'][Math.floor(Math.random() * 2)],
      appearances: 8 + Math.floor(Math.random() * 4),
      firstAppearance: new Date(2024, Math.floor(Math.random() * 6), 1).toISOString(),
      lastActivity: new Date(2024, 6, Math.floor(Math.random() * 9) + 1).toISOString(),
      justification: 'High Engagement',
      toolsUsed: ['Copilot Chat', 'Code Completion', 'Documentation', 'Debug Assistant'],
      reportDates: generateReportDates(8 + Math.floor(Math.random() * 4)),
      monthlyActivity: generateMonthlyActivity('high'),
      riskLevel: 'Low'
    })
  }
  
  // Generate Under-Utilized Users
  for (let i = 0; i < summary.under_utilized; i++) {
    users.push({
      email: `under${i + 1}@company.com`,
      classification: 'Under-Utilized',
      engagementScore: 1.0 + Math.random() * 1.0,
      consistencyPercent: 25 + Math.random() * 35,
      complexityScore: 2 + Math.random() * 4,
      avgToolsPerReport: 1 + Math.random() * 2,
      trend: ['Decreasing', 'Stable'][Math.floor(Math.random() * 2)],
      appearances: 2 + Math.floor(Math.random() * 4),
      firstAppearance: new Date(2024, Math.floor(Math.random() * 6), 1).toISOString(),
      lastActivity: new Date(2024, 4, Math.floor(Math.random() * 15) + 1).toISOString(),
      justification: 'Low consistency (active in 3 of 12 months); Downward usage trend',
      toolsUsed: ['Copilot Chat', 'Code Completion'],
      reportDates: generateReportDates(2 + Math.floor(Math.random() * 4)),
      monthlyActivity: generateMonthlyActivity('low'),
      riskLevel: 'Medium'
    })
  }
  
  // Generate For Reallocation Users
  for (let i = 0; i < summary.for_reallocation; i++) {
    users.push({
      email: `realloc${i + 1}@company.com`,
      classification: 'For Reallocation',
      engagementScore: Math.random() * 0.8,
      consistencyPercent: Math.random() * 25,
      complexityScore: Math.random() * 2,
      avgToolsPerReport: Math.random() * 1,
      trend: ['Decreasing', 'N/A'][Math.floor(Math.random() * 2)],
      appearances: 1 + Math.floor(Math.random() * 2),
      firstAppearance: new Date(2024, Math.floor(Math.random() * 6), 1).toISOString(),
      lastActivity: new Date(2024, 1, Math.floor(Math.random() * 15) + 1).toISOString(),
      justification: 'No activity in 90+ days; No tool usage recorded',
      toolsUsed: [],
      reportDates: generateReportDates(1 + Math.floor(Math.random() * 2)),
      monthlyActivity: generateMonthlyActivity('none'),
      riskLevel: 'High'
    })
  }
  
  return users.sort((a, b) => b.engagementScore - a.engagementScore)
}

function generateReportDates(count: number) {
  const dates = []
  for (let i = 0; i < count; i++) {
    dates.push(new Date(2024, i, 1).toISOString())
  }
  return dates
}

function generateMonthlyActivity(level: 'high' | 'low' | 'none') {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map(month => ({
    month,
    toolsUsed: level === 'high' ? 3 + Math.random() * 3 : 
                level === 'low' ? Math.random() * 2 : 0,
    complexity: level === 'high' ? 6 + Math.random() * 4 : 
                 level === 'low' ? Math.random() * 3 : 0
  }))
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
    
    // Generate comparison data for selected users
    const comparisonData = generateComparisonData(selectedUsers)
    
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

function generateComparisonData(selectedUsers: string[]) {
  return {
    averageEngagement: selectedUsers.length > 0 ? 1.5 + Math.random() * 1.5 : 0,
    totalToolsUsed: selectedUsers.length * (2 + Math.floor(Math.random() * 3)),
    commonTools: ['Copilot Chat', 'Code Completion'],
    trendAnalysis: {
      increasing: Math.floor(selectedUsers.length * 0.3),
      stable: Math.floor(selectedUsers.length * 0.5),
      decreasing: Math.floor(selectedUsers.length * 0.2)
    },
    riskDistribution: {
      low: Math.floor(selectedUsers.length * 0.4),
      medium: Math.floor(selectedUsers.length * 0.4),
      high: Math.floor(selectedUsers.length * 0.2)
    }
  }
}
