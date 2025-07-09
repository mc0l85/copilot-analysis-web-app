
import { NextRequest, NextResponse } from 'next/server'
import { createTestResults } from '@/lib/analysis-store'

export async function POST(request: NextRequest) {
  try {
    const testResults = createTestResults()
    
    return NextResponse.json({
      ...testResults,
      message: 'Test results created successfully'
    })
  } catch (error) {
    console.error('Test results error:', error)
    return NextResponse.json(
      { error: 'Failed to create test results' },
      { status: 500 }
    )
  }
}
