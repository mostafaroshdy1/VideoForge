import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { ProgressCard } from './ProgressCard'
import type { TranscodeJob } from '@/types'
import { Trash2 } from 'lucide-react'

interface ProcessingQueueProps {
  jobs: TranscodeJob[]
  onDownload: (job: TranscodeJob) => void
  onRemove: (jobId: string) => void
  onClearCompleted: () => void
  onCancel?: (jobId: string) => void
}

export function ProcessingQueue({
  jobs,
  onDownload,
  onRemove,
  onClearCompleted,
  onCancel,
}: ProcessingQueueProps) {
  const completedCount = jobs.filter((j) => j.status === 'completed').length
  const processingCount = jobs.filter((j) => j.status === 'processing').length
  const pendingCount = jobs.filter((j) => j.status === 'pending').length
  const errorCount = jobs.filter((j) => j.status === 'error').length

  if (jobs.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Processing Queue</CardTitle>
            <CardDescription>
              {processingCount > 0 && `${processingCount} processing, `}
              {pendingCount > 0 && `${pendingCount} pending, `}
              {completedCount > 0 && `${completedCount} completed`}
              {errorCount > 0 && `, ${errorCount} failed`}
            </CardDescription>
          </div>
          {completedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCompleted}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Completed
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((job) => (
          <ProgressCard
            key={job.id}
            job={job}
            onDownload={onDownload}
            onRemove={onRemove}
            onCancel={onCancel}
          />
        ))}
      </CardContent>
    </Card>
  )
}
