import { useState, useEffect, useCallback } from 'react'
import { Header } from './components/Header'
import { FileUploader } from './components/FileUploader'
import { TranscodeSettings } from './components/TranscodeSettings'
import { ProcessingQueue } from './components/ProcessingQueue'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert'
import { useFFmpeg } from './hooks/useFFmpeg'
import { useTranscodeStore } from './store/transcodeStore'
import { defaultSettings } from './lib/formats'
import { generateOutputFilename } from './lib/utils'
import type { VideoFile, TranscodeSettings as ITranscodeSettings, TranscodeJob } from './types'
import { v4 as uuidv4 } from 'uuid'
import { Play, Loader2, AlertCircle } from 'lucide-react'

function App() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [settings, setSettings] = useState<ITranscodeSettings>(defaultSettings)
  const [isProcessing, setIsProcessing] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const { transcode, load, isLoading: isLoadingFFmpeg, isReady } = useFFmpeg()
  const {
    jobs,
    addJob,
    updateJobProgress,
    updateJobStatus,
    setJobOutput,
    removeJob,
    clearCompleted,
    setCurrentJob,
    getNextPendingJob,
    abortCurrentJob,
  } = useTranscodeStore()

  // Auto-download completed jobs
  const downloadFile = useCallback((job: TranscodeJob) => {
    if (!job.outputBlob || !job.outputFilename) return

    const url = URL.createObjectURL(job.outputBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = job.outputFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // Process jobs in queue
  const processNextJob = useCallback(async () => {
    const nextJob = getNextPendingJob()
    if (!nextJob || isProcessing) return

    setIsProcessing(true)
    setCurrentJob(nextJob.id)
    updateJobStatus(nextJob.id, 'processing')

    try {
      // Ensure FFmpeg is loaded (will reload if terminated)
      setLoadError(null)
      await load()

      // Transcode the video
      const outputBlob = await transcode(
        nextJob.videoFile.file,
        nextJob.videoFile.settings,
        (progress) => {
          updateJobProgress(nextJob.id, progress)
        }
      )

      // Generate output filename
      const outputFilename = generateOutputFilename(
        nextJob.videoFile.name,
        nextJob.videoFile.settings.format
      )

      // Update job with output
      setJobOutput(nextJob.id, outputBlob, outputFilename)
      updateJobStatus(nextJob.id, 'completed')

      // Auto-download
      downloadFile({ ...nextJob, outputBlob, outputFilename } as TranscodeJob)
    } catch (error) {
      console.error('Transcode error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Check if it was cancelled by user
      if (errorMessage.includes('cancelled')) {
        updateJobStatus(nextJob.id, 'error', 'Cancelled by user')
        // FFmpeg was terminated, it will be reloaded on next job
      } else {
        // Check if it's an FFmpeg loading error
        if (errorMessage.includes('Failed to load FFmpeg')) {
          setLoadError(errorMessage)
        }
        
        updateJobStatus(
          nextJob.id,
          'error',
          errorMessage
        )
      }
    } finally {
      setIsProcessing(false)
      setCurrentJob(null)
    }
  }, [
    getNextPendingJob,
    isProcessing,
    load,
    transcode,
    updateJobProgress,
    updateJobStatus,
    setJobOutput,
    setCurrentJob,
    downloadFile,
  ])

  // Auto-process next job when previous completes
  useEffect(() => {
    if (!isProcessing) {
      processNextJob()
    }
  }, [jobs, isProcessing, processNextJob])

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      setSelectedFiles((prev) => [...prev, ...files])
    },
    []
  )

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleCancelJob = useCallback(() => {
    abortCurrentJob()
  }, [abortCurrentJob])

  const handleStartTranscode = useCallback(() => {
    if (selectedFiles.length === 0) return

    // Create jobs for all selected files
    selectedFiles.forEach((file) => {
      const videoFile: VideoFile = {
        id: uuidv4(),
        file,
        name: file.name,
        size: file.size,
        settings: { ...settings },
      }
      addJob(videoFile)
    })

    // Clear selected files
    setSelectedFiles([])
  }, [selectedFiles, settings, addJob])

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {loadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Load FFmpeg</AlertTitle>
            <AlertDescription>
              {loadError}
              <div className="mt-2 space-y-1 text-sm">
                <p className="font-medium">Possible solutions:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Refresh the page and try again</li>
                  <li>Check your internet connection</li>
                  <li>Make sure you're using a modern browser (Chrome, Firefox, or Edge)</li>
                  <li>Try disabling browser extensions that might block content</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Upload and Settings */}
          <div className="space-y-6">
            <FileUploader
              onFilesSelected={handleFilesSelected}
              selectedFiles={selectedFiles}
              onRemoveFile={handleRemoveFile}
            />

            <TranscodeSettings settings={settings} onChange={setSettings} />

            {selectedFiles.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleStartTranscode}
                    disabled={isProcessing || isLoadingFFmpeg}
                  >
                    {isLoadingFFmpeg ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading FFmpeg...
                      </>
                    ) : isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Start Transcoding ({selectedFiles.length}{' '}
                        {selectedFiles.length === 1 ? 'file' : 'files'})
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            {!isReady && jobs.length === 0 && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <h3 className="mb-2 font-semibold">How it works</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>1. Upload one or more video files</li>
                    <li>2. Configure output format and quality settings</li>
                    <li>3. Click "Start Transcoding" to begin</li>
                    <li>4. Videos will be processed and auto-downloaded</li>
                  </ul>
                  <p className="mt-4 text-xs text-muted-foreground">
                    All processing happens in your browser. Your files never leave
                    your device.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Queue */}
          <div>
            <ProcessingQueue
              jobs={jobs}
              onDownload={downloadFile}
              onRemove={removeJob}
              onClearCompleted={clearCompleted}
              onCancel={handleCancelJob}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
