
// Shared store for analysis results
export const analysisResults = new Map<string, any>()

// Helper function to create test results for demonstration
export function createTestResults() {
  const testSessionId = 'test-session-123'
  
  // Generate detailed user data for testing
  const detailed_users = []
  
  // Generate Top Utilizers (45 users)
  for (let i = 1; i <= 45; i++) {
    detailed_users.push({
      email: `user${i}@company.com`,
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
      reportDates: Array.from({length: 8 + Math.floor(Math.random() * 4)}, (_, i) => 
        new Date(2024, i, 1).toISOString()
      ),
      monthlyActivity: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
        month,
        toolsUsed: 3 + Math.random() * 3,
        complexity: 6 + Math.random() * 4
      })),
      riskLevel: 'Low'
    })
  }
  
  // Generate Under-Utilized Users (70 users)
  for (let i = 1; i <= 70; i++) {
    detailed_users.push({
      email: `under${i}@company.com`,
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
      reportDates: Array.from({length: 2 + Math.floor(Math.random() * 4)}, (_, i) => 
        new Date(2024, i, 1).toISOString()
      ),
      monthlyActivity: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
        month,
        toolsUsed: Math.random() * 2,
        complexity: Math.random() * 3
      })),
      riskLevel: 'Medium'
    })
  }
  
  // Generate For Reallocation Users (35 users)
  for (let i = 1; i <= 35; i++) {
    detailed_users.push({
      email: `realloc${i}@company.com`,
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
      reportDates: Array.from({length: 1 + Math.floor(Math.random() * 2)}, (_, i) => 
        new Date(2024, i, 1).toISOString()
      ),
      monthlyActivity: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
        month,
        toolsUsed: 0,
        complexity: 0
      })),
      riskLevel: 'High'
    })
  }
  
  const testResults = {
    status: 'success',
    summary: {
      total_users: 150,
      top_utilizers: 45,
      under_utilized: 70,
      for_reallocation: 35
    },
    files: {
      excel: '/home/ubuntu/copilot_web_app/app/temp/d49ca207-77b4-40da-9b3c-4cbaaadf6183/output/09-July-2025_Copilot_License_Evaluation.xlsx',
      html: '/home/ubuntu/copilot_web_app/app/temp/d49ca207-77b4-40da-9b3c-4cbaaadf6183/output/leaderboard.html'
    },
    sessionId: testSessionId,
    tempDir: '/home/ubuntu/copilot_web_app/app/temp/d49ca207-77b4-40da-9b3c-4cbaaadf6183',
    filePaths: [],
    detailed_users: detailed_users
  }
  
  analysisResults.set(testSessionId, testResults)
  return testResults
}
