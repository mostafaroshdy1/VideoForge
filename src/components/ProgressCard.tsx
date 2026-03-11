import { CheckCircle2, XCircle, Loader2, Download, Clock, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Button } from './ui/button'
import type { TranscodeJob } from '@/types'
import { formatFileSize, formatTime } from '@/lib/utils'

interface ProgressCardProps {
  job: TranscodeJob
  onDownload?: (job: TranscodeJob) => void
  onRemove?: (jobId: string) => void
  onCancel?: (jobId: string) => void
}

export function ProgressCard({ job, onDownload, onRemove, onCancel }: ProgressCardProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    switch (job.status) {
      case 'completed':
        return 'Completed'
      case 'error':
        return 'Failed'
      case 'processing':
        return 'Processing'
      case 'pending':
        return 'Pending'
      case 'cancelled':
        return 'Cancelled'
    }
  }

  const getTotalTime = () => {
    if (job.endTime && job.startTime) {
      return Math.floor((job.endTime - job.startTime) / 1000)
    }
    return 0
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base">{job.videoFile.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getStatusIcon()}
              <span>{getStatusText()}</span>
              {job.status === 'completed' && (
                <span className="text-xs">
                  ({formatTime(getTotalTime())})
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {job.status === 'processing' && onCancel && (
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => onCancel(job.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
            {job.status === 'completed' && job.outputBlob && onDownload && (
              <Button size="sm" variant="outline" onClick={() => onDownload(job)}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            {(job.status === 'completed' || job.status === 'error') && onRemove && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(job.id)}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress Bar */}
        {(job.status === 'processing' || job.status === 'completed') && (
          <div className="space-y-2">
            <Progress value={job.progress.percentage} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(job.progress.percentage)}%</span>
              {job.status === 'processing' && (
                <span>
                  {formatTime(job.progress.timeRemaining)} remaining
                </span>
              )}
            </div>
          </div>
        )}

        {/* Detailed Stats */}
        {job.status === 'processing' && (
          <div className="grid grid-cols-2 gap-4 rounded-md bg-muted/50 p-3 text-xs">
            <div>
              <div className="text-muted-foreground">Frame</div>
              <div className="font-medium">
                {job.progress.currentFrame.toLocaleString()}
                {job.progress.totalFrames > 0 &&
                  ` / ${job.progress.totalFrames.toLocaleString()}`}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">FPS</div>
              <div className="font-medium">
                {job.progress.fps.toFixed(1)} fps
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Speed</div>
              <div className="font-medium">{job.progress.speed}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Size</div>
              <div className="font-medium">
                {formatFileSize(job.progress.currentSize)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Elapsed</div>
              <div className="font-medium">
                {formatTime(job.progress.timeElapsed)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Format</div>
              <div className="font-medium uppercase">
                {job.videoFile.settings.format}
              </div>
            </div>
          </div>
        )}

        {/* Output Info */}
        {job.status === 'completed' && job.outputBlob && (
          <div className="rounded-md bg-muted/50 p-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-muted-foreground">Output Size</div>
                <div className="font-medium">
                  {formatFileSize(job.outputBlob.size)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Compression</div>
                <div className="font-medium">
                  {Math.round((1 - job.outputBlob.size / job.videoFile.size) * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {job.status === 'error' && job.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
            {job.error}
          </div>
        )}

        {/* Pending Info */}
        {job.status === 'pending' && (
          <div className="text-xs text-muted-foreground">
            Waiting to start...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
