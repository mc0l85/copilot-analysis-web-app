
// Shared store for analysis results
export const analysisResults = new Map<string, any>()

// Helper function to create test results for demonstration
export function createTestResults() {
  const testSessionId = 'test-session-123'
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
    filePaths: []
  }
  
  analysisResults.set(testSessionId, testResults)
  return testResults
}
