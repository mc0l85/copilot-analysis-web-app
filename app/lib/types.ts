
export interface AnalysisResult {
  status: 'success' | 'error'
  message?: string
  summary?: {
    total_users: number
    top_utilizers: number
    under_utilized: number
    for_reallocation: number
  }
  files?: {
    excel: string
    html: string
  }
  sessionId?: string
}

export interface FilterOptions {
  companies: string[]
  departments: string[]
  locations: string[]
  managers: string[]
}

export interface FileData {
  targetUsersFile: File | null
  usageReportsFiles: File[]
  filters: FilterOptions
  filterOptions: FilterOptions
}

export interface UserMetrics {
  Email: string
  'Usage Consistency (%)': number
  'Overall Recency': Date | null
  'Usage Complexity': number
  'Avg Tools / Report': number
  'Usage Trend': string
  Appearances: number
  'First Appearance': Date | null
  'Engagement Score': number
  Classification: string
  Justification: string
}
