
'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, X, File, FileSpreadsheet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  label: string
  accept: string
  multiple: boolean
  onUpload: (files: File[]) => void
  uploadedFiles: File[]
  description?: string
}

export function FileUpload({ 
  label, 
  accept, 
  multiple, 
  onUpload, 
  uploadedFiles, 
  description 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => {
      const acceptTypes = accept.split(',').map(type => type.trim())
      return acceptTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        }
        return file.type.match(type)
      })
    })
    
    if (validFiles.length > 0) {
      onUpload(multiple ? validFiles : [validFiles[0]])
    }
  }, [accept, multiple, onUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onUpload(multiple ? files : [files[0]])
    }
  }, [multiple, onUpload])

  const removeFile = useCallback((index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    onUpload(newFiles)
  }, [uploadedFiles, onUpload])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {uploadedFiles.length > 0 && (
          <Badge variant="secondary">
            {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag & drop files here or click to browse
            </p>
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              className="hidden"
              id={`file-upload-${label}`}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
            >
              Select Files
            </Button>
            {description && (
              <p className="text-xs text-muted-foreground mt-2">{description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
