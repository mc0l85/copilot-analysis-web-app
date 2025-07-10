import { writeFile, readFile, mkdir, access } from 'fs/promises'
import path from 'path'

// File-based persistent storage for analysis results
class PersistentAnalysisStore {
  private storageDir: string
  private memoryCache = new Map<string, any>()

  constructor() {
    this.storageDir = path.join(process.cwd(), 'temp', 'sessions')
  }

  private async ensureStorageDir() {
    try {
      await access(this.storageDir)
    } catch {
      await mkdir(this.storageDir, { recursive: true })
    }
  }

  private getSessionFilePath(sessionId: string): string {
    return path.join(this.storageDir, `${sessionId}.json`)
  }

  async set(sessionId: string, data: any): Promise<void> {
    try {
      await this.ensureStorageDir()
      
      // Store in memory cache for quick access
      this.memoryCache.set(sessionId, data)
      
      // Persist to file system
      const filePath = this.getSessionFilePath(sessionId)
      await writeFile(filePath, JSON.stringify(data, null, 2))
      
      console.log(`Session ${sessionId} stored successfully`)
    } catch (error) {
      console.error(`Failed to store session ${sessionId}:`, error)
      // Still keep in memory cache as fallback
      this.memoryCache.set(sessionId, data)
    }
  }

  async get(sessionId: string): Promise<any | undefined> {
    try {
      // First check memory cache
      if (this.memoryCache.has(sessionId)) {
        console.log(`Session ${sessionId} found in memory cache`)
        return this.memoryCache.get(sessionId)
      }

      // Try to load from file system
      const filePath = this.getSessionFilePath(sessionId)
      const fileContent = await readFile(filePath, 'utf-8')
      const data = JSON.parse(fileContent)
      
      // Cache in memory for future access
      this.memoryCache.set(sessionId, data)
      
      console.log(`Session ${sessionId} loaded from file system`)
      return data
    } catch (error) {
      console.log(`Session ${sessionId} not found:`, error.message)
      return undefined
    }
  }

  async delete(sessionId: string): Promise<void> {
    try {
      // Remove from memory cache
      this.memoryCache.delete(sessionId)
      
      // Remove from file system
      const filePath = this.getSessionFilePath(sessionId)
      const { unlink } = await import('fs/promises')
      await unlink(filePath)
      
      console.log(`Session ${sessionId} deleted successfully`)
    } catch (error) {
      console.error(`Failed to delete session ${sessionId}:`, error)
    }
  }

  keys(): string[] {
    return Array.from(this.memoryCache.keys())
  }

  async getAllKeys(): Promise<string[]> {
    try {
      await this.ensureStorageDir()
      const { readdir } = await import('fs/promises')
      const files = await readdir(this.storageDir)
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''))
    } catch (error) {
      console.error('Failed to get all session keys:', error)
      return this.keys()
    }
  }
}

// Create a singleton instance
const persistentStore = new PersistentAnalysisStore()

// Export a Map-like interface for backward compatibility
export const analysisResults = {
  async set(sessionId: string, data: any): Promise<void> {
    return persistentStore.set(sessionId, data)
  },
  
  async get(sessionId: string): Promise<any | undefined> {
    return persistentStore.get(sessionId)
  },
  
  async delete(sessionId: string): Promise<void> {
    return persistentStore.delete(sessionId)
  },
  
  keys(): string[] {
    return persistentStore.keys()
  },

  async getAllKeys(): Promise<string[]> {
    return persistentStore.getAllKeys()
  }
}

// For backward compatibility with synchronous access patterns
// This maintains an in-memory fallback
const legacyMap = new Map<string, any>()

// Legacy synchronous interface (deprecated but maintained for compatibility)
export const analysisResultsLegacy = {
  set(sessionId: string, data: any): void {
    legacyMap.set(sessionId, data)
    // Also store in persistent storage asynchronously
    persistentStore.set(sessionId, data).catch(console.error)
  },
  
  get(sessionId: string): any | undefined {
    return legacyMap.get(sessionId)
  },
  
  delete(sessionId: string): void {
    legacyMap.delete(sessionId)
    persistentStore.delete(sessionId).catch(console.error)
  },
  
  keys(): string[] {
    return Array.from(legacyMap.keys())
  }
}

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
  
  // Store using the new persistent storage
  persistentStore.set(testSessionId, testResults).catch(console.error)
  return testResults
}
