'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Filter
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart
} from 'recharts'

interface User {
  email: string
  classification: 'Top Utilizer' | 'Under-Utilized' | 'For Reallocation'
  engagementScore: number
  consistencyPercent: number
  complexityScore: number
  avgToolsPerReport: number
  trend: string
  appearances: number
  firstAppearance: string
  lastActivity: string
  justification: string
  toolsUsed: string[]
  reportDates: string[]
  monthlyActivity: Array<{
    month: string
    toolsUsed: number
    complexity: number
  }>
  riskLevel: 'Low' | 'Medium' | 'High'
}

interface DeepDiveAnalysisProps {
  sessionId: string | null
}

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3', '#72BF78']

function getClassificationColor(classification: string) {
  switch (classification) {
    case 'Top Utilizer': return 'bg-green-100 text-green-800'
    case 'Under-Utilized': return 'bg-yellow-100 text-yellow-800'
    case 'For Reallocation': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getRiskIcon(risk: string) {
  switch (risk) {
    case 'Low': return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'Medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    case 'High': return <XCircle className="h-4 w-4 text-red-600" />
    default: return <AlertTriangle className="h-4 w-4 text-gray-600" />
  }
}

export function DeepDiveAnalysis({ sessionId }: DeepDiveAnalysisProps) {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [classificationFilter, setClassificationFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [dataLoaded, setDataLoaded] = useState(false)
  
  const { toast } = useToast()
  const fetchAttemptRef = useRef<string | null>(null)

  // Fetch user data with proper error handling and race condition prevention
  const fetchUsers = useCallback(async (currentSessionId: string) => {
    if (!currentSessionId) return
    
    // Prevent race conditions by tracking the current fetch attempt
    fetchAttemptRef.current = currentSessionId
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/deep-dive?sessionId=${currentSessionId}`)
      
      // Check if this is still the current session we care about
      if (fetchAttemptRef.current !== currentSessionId) {
        return // Ignore this response as a newer request is in progress
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Double-check we're still on the same session
      if (fetchAttemptRef.current === currentSessionId) {
        const userData = data.users || []
        setUsers(userData)
        setFilteredUsers(userData)
        setDataLoaded(true)
      }
    } catch (error) {
      // Only set error if this is still the current session
      if (fetchAttemptRef.current === currentSessionId) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load user data'
        setError(errorMessage)
        console.error('Error fetching users:', error)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } finally {
      // Only clear loading if this is still the current session
      if (fetchAttemptRef.current === currentSessionId) {
        setLoading(false)
      }
    }
  }, [toast]) // Removed selectedUsers.size from dependencies to prevent infinite loop

  // Effect to fetch data when sessionId changes
  useEffect(() => {
    if (sessionId) {
      // Reset state when sessionId changes
      setUsers([])
      setFilteredUsers([])
      setSelectedUsers(new Set())
      setComparisonData(null)
      setDataLoaded(false)
      setError(null)
      
      fetchUsers(sessionId)
    } else {
      // Clear data when no sessionId
      setUsers([])
      setFilteredUsers([])
      setSelectedUsers(new Set())
      setComparisonData(null)
      setDataLoaded(false)
      setError(null)
      setLoading(false)
    }
  }, [sessionId, fetchUsers])

  // Separate effect to handle auto-selection after data is loaded
  useEffect(() => {
    if (dataLoaded && users.length > 0 && selectedUsers.size === 0) {
      // Auto-expand details pane by selecting first user if available
      setSelectedUsers(new Set([users[0].email]))
      setActiveTab('individual')
    }
  }, [dataLoaded, users, selectedUsers.size])

  // Memoized filter function to prevent unnecessary re-renders
  const applyFilters = useCallback((userList: User[], query: string, classification: string) => {
    let filtered = userList
    
    if (query.trim()) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(lowerQuery)
      )
    }
    
    if (classification !== 'all') {
      filtered = filtered.filter(user => 
        user.classification === classification
      )
    }
    
    return filtered
  }, [])

  // Filter users based on search and classification with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = applyFilters(users, searchQuery, classificationFilter)
      setFilteredUsers(filtered)
    }, 150) // Small debounce to prevent excessive filtering

    return () => clearTimeout(timeoutId)
  }, [users, searchQuery, classificationFilter, applyFilters])

  // Memoized comparison data generation
  const generateComparisonData = useCallback((selectedUserEmails: Set<string>, allUsers: User[]) => {
    if (selectedUserEmails.size === 0) return null
    
    const selectedUserArray = Array.from(selectedUserEmails)
    const selectedUserData = allUsers.filter(user => selectedUserEmails.has(user.email))
    
    if (selectedUserData.length === 0) return null
    
    const comparison = {
      averageEngagement: selectedUserData.reduce((sum, user) => sum + user.engagementScore, 0) / selectedUserData.length,
      averageConsistency: selectedUserData.reduce((sum, user) => sum + user.consistencyPercent, 0) / selectedUserData.length,
      totalToolsUsed: new Set(selectedUserData.flatMap(user => user.toolsUsed)).size,
      commonTools: getCommonTools(selectedUserData),
      trendAnalysis: getTrendAnalysis(selectedUserData),
      riskDistribution: getRiskDistribution(selectedUserData),
      monthlyComparison: getMonthlyComparison(selectedUserData)
    }
    
    return comparison
  }, [])

  // Generate comparison data when users are selected
  useEffect(() => {
    const comparison = generateComparisonData(selectedUsers, users)
    setComparisonData(comparison)
  }, [selectedUsers, users, generateComparisonData])

  const getCommonTools = useCallback((users: User[]) => {
    if (users.length === 0) return []
    
    const toolCounts = users.reduce((acc, user) => {
      user.toolsUsed.forEach(tool => {
        acc[tool] = (acc[tool] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(toolCounts)
      .filter(([_, count]) => count > users.length * 0.5)
      .map(([tool, count]) => ({ tool, count }))
  }, [])

  const getTrendAnalysis = useCallback((users: User[]) => {
    const trends = users.reduce((acc, user) => {
      acc[user.trend] = (acc[user.trend] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(trends).map(([trend, count]) => ({ trend, count }))
  }, [])

  const getRiskDistribution = useCallback((users: User[]) => {
    const risks = users.reduce((acc, user) => {
      acc[user.riskLevel] = (acc[user.riskLevel] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(risks).map(([risk, count]) => ({ risk, count }))
  }, [])

  const getMonthlyComparison = useCallback((users: User[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    return months.map(month => {
      const monthData = users.map(user => {
        const userMonth = user.monthlyActivity.find(m => m.month === month)
        return userMonth || { month, toolsUsed: 0, complexity: 0 }
      })
      
      return {
        month,
        averageToolsUsed: monthData.reduce((sum, data) => sum + data.toolsUsed, 0) / users.length,
        averageComplexity: monthData.reduce((sum, data) => sum + data.complexity, 0) / users.length
      }
    })
  }, [])

  const toggleUserSelection = useCallback((email: string) => {
    setSelectedUsers(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(email)) {
        newSelected.delete(email)
      } else {
        newSelected.add(email)
      }
      
      // Auto-switch to appropriate tab based on selection
      if (newSelected.size === 1) {
        setActiveTab('individual')
      } else if (newSelected.size > 1) {
        setActiveTab('comparison')
      }
      
      return newSelected
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedUsers(new Set())
    setActiveTab('overview')
  }, [])

  const selectAllFiltered = useCallback(() => {
    setSelectedUsers(new Set(filteredUsers.map(user => user.email)))
    if (filteredUsers.length > 1) {
      setActiveTab('comparison')
    } else if (filteredUsers.length === 1) {
      setActiveTab('individual')
    }
  }, [filteredUsers])

  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'Increasing': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'Decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'Stable': return <Minus className="h-4 w-4 text-yellow-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }, [])

  // Memoized statistics to prevent unnecessary recalculations
  const classificationStats = useMemo(() => {
    if (users.length === 0) return []
    
    const stats = users.reduce((acc, user) => {
      acc[user.classification] = (acc[user.classification] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(stats).map(([classification, count]) => ({
      classification,
      count,
      percentage: (count / users.length) * 100
    }))
  }, [users])

  const engagementDistribution = useMemo(() => {
    if (users.length === 0) return []
    
    const ranges = [
      { range: '0-0.5', min: 0, max: 0.5 },
      { range: '0.5-1.0', min: 0.5, max: 1.0 },
      { range: '1.0-1.5', min: 1.0, max: 1.5 },
      { range: '1.5-2.0', min: 1.5, max: 2.0 },
      { range: '2.0-2.5', min: 2.0, max: 2.5 },
      { range: '2.5+', min: 2.5, max: 10 }
    ]
    
    return ranges.map(({ range, min, max }) => ({
      range,
      count: users.filter(user => user.engagementScore >= min && user.engagementScore < max).length
    }))
  }, [users])

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading user data...</span>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => sessionId && fetchUsers(sessionId)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Show empty state
  if (!dataLoaded || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No User Data Available</h3>
          <p className="text-muted-foreground">
            {!sessionId ? 'Please run an analysis first to view deep dive data.' : 'No detailed user data found for this analysis.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            User Search & Filter
          </CardTitle>
          <CardDescription>
            Search and filter users to analyze their Copilot usage patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={classificationFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setClassificationFilter('all')}
                size="sm"
              >
                All ({users.length})
              </Button>
              <Button
                variant={classificationFilter === 'Top Utilizer' ? 'default' : 'outline'}
                onClick={() => setClassificationFilter('Top Utilizer')}
                size="sm"
              >
                Top ({users.filter(u => u.classification === 'Top Utilizer').length})
              </Button>
              <Button
                variant={classificationFilter === 'Under-Utilized' ? 'default' : 'outline'}
                onClick={() => setClassificationFilter('Under-Utilized')}
                size="sm"
              >
                Under ({users.filter(u => u.classification === 'Under-Utilized').length})
              </Button>
              <Button
                variant={classificationFilter === 'For Reallocation' ? 'default' : 'outline'}
                onClick={() => setClassificationFilter('For Reallocation')}
                size="sm"
              >
                Realloc ({users.filter(u => u.classification === 'For Reallocation').length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* User List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users ({filteredUsers.length})
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllFiltered}
                  disabled={filteredUsers.length === 0}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  disabled={selectedUsers.size === 0}
                >
                  Clear ({selectedUsers.size})
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.email}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedUsers.has(user.email) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => toggleUserSelection(user.email)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedUsers.has(user.email)}
                        onChange={() => toggleUserSelection(user.email)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {user.email}
                          </span>
                          {getRiskIcon(user.riskLevel)}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getClassificationColor(user.classification)}`}
                          >
                            {user.classification}
                          </Badge>
                          {getTrendIcon(user.trend)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Score: {user.engagementScore.toFixed(2)}</span>
                          <span>{user.consistencyPercent.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Analysis Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analysis Dashboard
            </CardTitle>
            <CardDescription>
              {selectedUsers.size > 0 
                ? `Analyzing ${selectedUsers.size} selected user${selectedUsers.size > 1 ? 's' : ''}`
                : 'Select users to view detailed analysis'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Classification Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPieChart>
                          <Pie
                            data={classificationStats}
                            dataKey="count"
                            nameKey="classification"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({classification, percentage}) => `${classification.split(' ')[0]}: ${percentage.toFixed(0)}%`}
                          >
                            {classificationStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Engagement Score Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={engagementDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" tick={{fontSize: 10}} />
                          <YAxis tick={{fontSize: 10}} />
                          <Tooltip />
                          <Bar dataKey="count" fill={COLORS[0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="individual" className="space-y-4">
                {selectedUsers.size === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a user from the list to view individual analysis
                  </div>
                ) : selectedUsers.size > 1 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Select only one user to view individual analysis
                  </div>
                ) : (
                  (() => {
                    const selectedUser = users.find(user => selectedUsers.has(user.email))
                    if (!selectedUser) return null
                    
                    return (
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>{selectedUser.email}</span>
                              <div className="flex items-center gap-2">
                                <Badge className={getClassificationColor(selectedUser.classification)}>
                                  {selectedUser.classification}
                                </Badge>
                                {getRiskIcon(selectedUser.riskLevel)}
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Engagement Score:</span>
                                  <span className="font-medium">{selectedUser.engagementScore.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Consistency:</span>
                                  <span className="font-medium">{selectedUser.consistencyPercent.toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Complexity Score:</span>
                                  <span className="font-medium">{selectedUser.complexityScore.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Avg Tools/Report:</span>
                                  <span className="font-medium">{selectedUser.avgToolsPerReport.toFixed(1)}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Appearances:</span>
                                  <span className="font-medium">{selectedUser.appearances}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">First Seen:</span>
                                  <span className="font-medium">{selectedUser.firstAppearance}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Last Activity:</span>
                                  <span className="font-medium">{selectedUser.lastActivity}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Trend:</span>
                                  <div className="flex items-center gap-1">
                                    {getTrendIcon(selectedUser.trend)}
                                    <span className="font-medium">{selectedUser.trend}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <div className="space-y-3">
                              <h4 className="font-medium">Justification</h4>
                              <p className="text-sm text-muted-foreground">{selectedUser.justification}</p>
                            </div>
                            
                            <Separator className="my-4" />
                            
                            <div className="space-y-3">
                              <h4 className="font-medium">Tools Used ({selectedUser.toolsUsed.length})</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedUser.toolsUsed.map((tool, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tool}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Monthly Activity Trend</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <RechartsLineChart data={selectedUser.monthlyActivity}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line 
                                  type="monotone" 
                                  dataKey="toolsUsed" 
                                  stroke={COLORS[0]} 
                                  strokeWidth={2}
                                  name="Tools Used"
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="complexity" 
                                  stroke={COLORS[1]} 
                                  strokeWidth={2}
                                  name="Complexity"
                                />
                                <Legend />
                              </RechartsLineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })()
                )}
              </TabsContent>
              
              <TabsContent value="comparison" className="space-y-4">
                {selectedUsers.size < 2 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Select multiple users to view comparison analysis
                  </div>
                ) : !comparisonData ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading comparison data...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Average Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Avg Engagement:</span>
                              <span className="font-medium">{comparisonData.averageEngagement.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Avg Consistency:</span>
                              <span className="font-medium">{comparisonData.averageConsistency.toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Total Tools Used:</span>
                              <span className="font-medium">{comparisonData.totalToolsUsed}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Risk Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={150}>
                            <RechartsPieChart>
                              <Pie
                                data={comparisonData.riskDistribution}
                                dataKey="count"
                                nameKey="risk"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                label={({risk, count}) => `${risk}: ${count}`}
                              >
                                {comparisonData.riskDistribution.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Common Tools</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {comparisonData.commonTools.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {comparisonData.commonTools.map((toolData: any, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {toolData.tool} ({toolData.count})
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No common tools found among selected users</p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Monthly Comparison</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={comparisonData.monthlyComparison}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Area 
                              type="monotone" 
                              dataKey="averageToolsUsed" 
                              stackId="1"
                              stroke={COLORS[0]} 
                              fill={COLORS[0]}
                              name="Avg Tools Used"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="averageComplexity" 
                              stackId="2"
                              stroke={COLORS[1]} 
                              fill={COLORS[1]}
                              name="Avg Complexity"
                            />
                            <Legend />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="trends" className="space-y-4">
                {comparisonData && selectedUsers.size > 0 ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Trend Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={comparisonData.trendAnalysis}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="trend" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill={COLORS[2]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select users to view trend analysis
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}