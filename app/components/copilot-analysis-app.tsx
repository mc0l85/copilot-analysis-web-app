'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/file-upload'
import { FilterPanel } from '@/components/filter-panel'
import { AnalysisResults } from '@/components/analysis-results'
import { ProcessingStatus } from '@/components/processing-status'
import { DeepDiveAnalysis } from '@/components/deep-dive-analysis'
import { Button } from '@/components/ui/button'
import { BarChart3, Users, TrendingUp, FileSpreadsheet, Trophy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AnalysisState {
  isProcessing: boolean
  results: any
  error: string | null
  sessionId: string | null
}

interface FileData {
  targetUsersFile: File | null
  usageReportsFiles: File[]
  filters: {
    companies: string[]
    departments: string[]
    locations: string[]
    managers: string[]
  }
  filterOptions: {
    companies: string[]
    departments: string[]
    locations: string[]
    managers: string[]
  }
}

export function CopilotAnalysisApp() {
  const [activeTab, setActiveTab] = useState('analysis')
  const [fileData, setFileData] = useState<FileData>({
    targetUsersFile: null,
    usageReportsFiles: [],
    filters: {
      companies: [],
      departments: [],
      locations: [],
      managers: []
    },
    filterOptions: {
      companies: [],
      departments: [],
      locations: [],
      managers: []
    }
  })
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isProcessing: false,
    results: null,
    error: null,
    sessionId: null
  })

  const { toast } = useToast()

  // Check for existing analysis results on component mount
  useEffect(() => {
    const checkForExistingResults = async () => {
      try {
        // Try to create test results for demonstration
        const testResponse = await fetch('/api/test-results', { method: 'POST' })
        if (testResponse.ok) {
          const testResults = await testResponse.json()
          setAnalysisState(prev => ({
            ...prev,
            results: testResults,
            sessionId: testResults.sessionId
          }))
          
          toast({
            title: "Demo data loaded",
            description: "Sample analysis results loaded for demonstration. Upload your own files to replace with real data."
          })
        }
      } catch (error) {
        console.log('No test results available, starting fresh')
      }
    }
    
    checkForExistingResults()
  }, [toast])

  const handleTargetUsersUpload = useCallback((file: File) => {
    setFileData(prev => ({ ...prev, targetUsersFile: file }))
    
    // Parse the file to extract filter options
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        
        const companyIndex = headers.findIndex(h => h.toLowerCase().includes('company'))
        const departmentIndex = headers.findIndex(h => h.toLowerCase().includes('department'))
        const locationIndex = headers.findIndex(h => h.toLowerCase().includes('city'))
        const managerIndex = headers.findIndex(h => h.toLowerCase().includes('manager'))
        
        const companies = new Set<string>()
        const departments = new Set<string>()
        const locations = new Set<string>()
        const managers = new Set<string>()
        
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''))
          
          if (companyIndex !== -1 && row[companyIndex]) {
            companies.add(row[companyIndex])
          }
          if (departmentIndex !== -1 && row[departmentIndex]) {
            departments.add(row[departmentIndex])
          }
          if (locationIndex !== -1 && row[locationIndex]) {
            locations.add(row[locationIndex])
          }
          if (managerIndex !== -1 && row[managerIndex]) {
            const managerChain = row[managerIndex].split('->')
            managerChain.forEach(manager => managers.add(manager.trim()))
          }
        }
        
        setFileData(prev => ({
          ...prev,
          filterOptions: {
            companies: Array.from(companies).filter(c => c).sort(),
            departments: Array.from(departments).filter(d => d).sort(),
            locations: Array.from(locations).filter(l => l).sort(),
            managers: Array.from(managers).filter(m => m).sort()
          }
        }))
        
        toast({
          title: "Target users file uploaded",
          description: "Filter options have been populated based on your data."
        })
      } catch (error) {
        console.error('Error parsing file:', error)
        toast({
          title: "Error parsing file",
          description: "Could not extract filter options from the target users file.",
          variant: "destructive"
        })
      }
    }
    reader.readAsText(file)
  }, [toast])

  const handleUsageReportsUpload = useCallback((files: File[]) => {
    setFileData(prev => ({ ...prev, usageReportsFiles: files }))
    toast({
      title: "Usage reports uploaded",
      description: `${files.length} file(s) uploaded successfully.`
    })
  }, [toast])

  const handleFilterChange = useCallback((filterType: string, values: string[]) => {
    setFileData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: values
      }
    }))
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (fileData.usageReportsFiles.length === 0) {
      toast({
        title: "Missing files",
        description: "Please upload at least one usage report file.",
        variant: "destructive"
      })
      return
    }

    setAnalysisState(prev => ({ ...prev, isProcessing: true, error: null }))

    try {
      const formData = new FormData()
      
      // Add target users file if provided
      if (fileData.targetUsersFile) {
        formData.append('targetUsersFile', fileData.targetUsersFile)
      }
      
      // Add usage report files
      fileData.usageReportsFiles.forEach((file, index) => {
        formData.append(`usageReportFile_${index}`, file)
      })
      
      // Add filters
      formData.append('filters', JSON.stringify(fileData.filters))
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }
      
      const results = await response.json()
      
      if (results.status === 'error') {
        throw new Error(results.message)
      }
      
      setAnalysisState(prev => ({
        ...prev,
        isProcessing: false,
        results,
        error: null,
        sessionId: results.sessionId
      }))
      
      toast({
        title: "Analysis completed",
        description: "Your Copilot usage analysis has been generated successfully."
      })
      
    } catch (error) {
      setAnalysisState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }))
      
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      })
    }
  }, [fileData, toast])

  const canAnalyze = fileData.usageReportsFiles.length > 0 && !analysisState.isProcessing

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Copilot Usage Analysis
        </h1>
        <p className="text-xl text-muted-foreground">
          Analyze Microsoft Copilot adoption patterns and user engagement
        </p>
      </div>

      {/* Responsive Grid Layout - Auto-expanding right panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Control Panel - Full width on mobile, 3 columns on xl screens when results exist, 4 when no results */}
        <div className={`space-y-6 ${analysisState.results ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                1. Upload Data
              </CardTitle>
              <CardDescription>
                Upload your target users and usage report files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                label="Target Users File (Optional)"
                accept=".csv,.xlsx,.xls"
                multiple={false}
                onUpload={(files) => handleTargetUsersUpload(files[0])}
                uploadedFiles={fileData.targetUsersFile ? [fileData.targetUsersFile] : []}
                description="CSV or Excel file containing user information"
              />
              
              <FileUpload
                label="Usage Reports (Required)"
                accept=".csv,.xlsx,.xls"
                multiple={true}
                onUpload={handleUsageReportsUpload}
                uploadedFiles={fileData.usageReportsFiles}
                description="One or more CSV or Excel files with usage data"
              />
            </CardContent>
          </Card>

          {/* Filters Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                2. Apply Filters (Optional)
              </CardTitle>
              <CardDescription>
                Filter users by company, department, location, or manager
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FilterPanel
                filterOptions={fileData.filterOptions}
                filters={fileData.filters}
                onFilterChange={handleFilterChange}
              />
            </CardContent>
          </Card>

          {/* Analysis Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="w-full"
                size="lg"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                {analysisState.isProcessing ? 'Analyzing...' : 'Analyze Data'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel - Full width on mobile, 9 columns when results exist, 8 when no results */}
        <div className={`${analysisState.results ? 'xl:col-span-9' : 'xl:col-span-8'}`}>
          <Card className="h-full min-h-[600px]">
            <CardContent className="p-6 h-full">
              {analysisState.isProcessing && (
                <div className="flex items-center justify-center h-full">
                  <ProcessingStatus />
                </div>
              )}
              
              {analysisState.error && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-12">
                    <div className="text-destructive mb-4">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">Analysis Failed</h3>
                    </div>
                    <p className="text-muted-foreground">{analysisState.error}</p>
                  </div>
                </div>
              )}
              
              {!analysisState.isProcessing && !analysisState.error && !analysisState.results && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      <Trophy className="h-12 w-12 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">Ready to Analyze</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Your analysis results will appear here after processing
                    </p>
                  </div>
                </div>
              )}
              
              {analysisState.results && (
                <div className="h-full flex flex-col">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                      <TabsTrigger value="deep-dive">Deep Dive</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex-1 overflow-auto">
                      <TabsContent value="analysis" className="mt-0 h-full">
                        <AnalysisResults results={analysisState.results} sessionId={analysisState.sessionId} />
                      </TabsContent>
                      
                      <TabsContent value="leaderboard" className="mt-0 h-full">
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center py-8">
                            <Trophy className="h-12 w-12 mx-auto mb-4 text-primary" />
                            <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
                            <p className="text-muted-foreground mb-4">
                              View top performing users in the interactive leaderboard
                            </p>
                            <Button
                              onClick={() => window.open(`/api/download/leaderboard?sessionId=${analysisState.sessionId}`, '_blank')}
                              variant="outline"
                            >
                              Open Leaderboard
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="deep-dive" className="mt-0 h-full">
                        <DeepDiveAnalysis sessionId={analysisState.sessionId} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}