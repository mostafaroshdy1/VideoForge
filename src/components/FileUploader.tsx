import { useCallback, useState } from 'react'
import { Upload, File as FileIcon, X } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { formatFileSize } from '@/lib/utils'

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
  selectedFiles: File[]
  onRemoveFile: (index: number) => void
}

export function FileUploader({ onFilesSelected, selectedFiles, onRemoveFile }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('video/')
      )

      if (files.length > 0) {
        onFilesSelected(files)
      }
    },
    [onFilesSelected]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        onFilesSelected(files)
      }
      e.target.value = '' // Reset input
    },
    [onFilesSelected]
  )

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">
            Drop video files here
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            or click the button below to select files
          </p>
          <label htmlFor="file-input">
            <Button type="button" onClick={() => document.getElementById('file-input')?.click()}>
              Select Files
            </Button>
          </label>
          <input
            id="file-input"
            type="file"
            multiple
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="mt-4 text-xs text-muted-foreground">
            Supports: MP4, WebM, AVI, MOV, MKV, FLV, and more
          </p>
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      <FileIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
