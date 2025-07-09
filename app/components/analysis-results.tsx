
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, TrendingUp, TrendingDown, Download, FileSpreadsheet, Trophy } from 'lucide-react'

interface AnalysisResultsProps {
  results: {
    summary: {
      total_users: number
      top_utilizers: number
      under_utilized: number
      for_reallocation: number
    }
    files: {
      excel: string
      html: string
    }
  }
  sessionId: string | null
}

interface CountUpProps {
  end: number
  duration?: number
  className?: string
}

function CountUp({ end, duration = 1000, className = '' }: CountUpProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration])

  return <span className={className}>{count.toLocaleString()}</span>
}

export function AnalysisResults({ results, sessionId }: AnalysisResultsProps) {
  const { summary } = results

  const topUtilizersPercentage = summary.total_users > 0 
    ? (summary.top_utilizers / summary.total_users) * 100 
    : 0

  const underUtilizedPercentage = summary.total_users > 0 
    ? (summary.under_utilized / summary.total_users) * 100 
    : 0

  const reallocationPercentage = summary.total_users > 0 
    ? (summary.for_reallocation / summary.total_users) * 100 
    : 0

  const handleDownload = async (type: 'excel' | 'html') => {
    try {
      const url = `/api/download/${type}${sessionId ? `?sessionId=${sessionId}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = type === 'excel' ? 'copilot_analysis.xlsx' : 'leaderboard.html'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold count-up">
                  <CountUp end={summary.total_users} />
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Utilizers</p>
                <p className="text-2xl font-bold text-green-600 count-up">
                  <CountUp end={summary.top_utilizers} />
                </p>
                <p className="text-xs text-muted-foreground">
                  {topUtilizersPercentage.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under-Utilized</p>
                <p className="text-2xl font-bold text-yellow-600 count-up">
                  <CountUp end={summary.under_utilized} />
                </p>
                <p className="text-xs text-muted-foreground">
                  {underUtilizedPercentage.toFixed(1)}%
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">For Reallocation</p>
                <p className="text-2xl font-bold text-red-600 count-up">
                  <CountUp end={summary.for_reallocation} />
                </p>
                <p className="text-xs text-muted-foreground">
                  {reallocationPercentage.toFixed(1)}%
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Usage Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Top Utilizers
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {summary.top_utilizers} users
                </span>
              </div>
              <span className="text-sm font-medium">
                {topUtilizersPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={topUtilizersPercentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Under-Utilized
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {summary.under_utilized} users
                </span>
              </div>
              <span className="text-sm font-medium">
                {underUtilizedPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={underUtilizedPercentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  For Reallocation
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {summary.for_reallocation} users
                </span>
              </div>
              <span className="text-sm font-medium">
                {reallocationPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={reallocationPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Download Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => handleDownload('excel')}
              className="flex-1"
              variant="outline"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Download Excel Report
            </Button>
            <Button
              onClick={() => handleDownload('html')}
              className="flex-1"
              variant="outline"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Download HTML Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
