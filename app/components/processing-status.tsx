
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, BarChart3, FileText, Trophy } from 'lucide-react'

const processingSteps = [
  { id: 1, label: 'Loading data files', icon: FileText },
  { id: 2, label: 'Applying filters', icon: BarChart3 },
  { id: 3, label: 'Analyzing user patterns', icon: BarChart3 },
  { id: 4, label: 'Generating reports', icon: FileText },
  { id: 5, label: 'Creating leaderboard', icon: Trophy },
]

export function ProcessingStatus() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 800)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= processingSteps.length - 1) {
          return processingSteps.length - 1
        }
        return prev + 1
      })
    }, 2000)

    return () => clearInterval(stepInterval)
  }, [])

  return (
    <div className="text-center py-12 w-full">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="space-y-2">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h3 className="text-lg font-semibold">Processing Your Data</h3>
          <p className="text-muted-foreground">
            Please wait while we analyze your Copilot usage data
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="space-y-3">
                {processingSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index === currentStep
                  const isCompleted = index < currentStep
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : isCompleted 
                          ? 'bg-muted text-muted-foreground' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />
                      <span className="text-sm">{step.label}</span>
                      {isCompleted && (
                        <div className="ml-auto">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                        </div>
                      )}
                      {isActive && (
                        <div className="ml-auto">
                          <Loader2 className="h-3 w-3 animate-spin" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
