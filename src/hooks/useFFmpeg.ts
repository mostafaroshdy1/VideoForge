import { useState, useRef, useCallback } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { loadFFmpeg, transcodeVideo } from '@/lib/ffmpeg'
import type { TranscodeSettings, TranscodeProgress } from '@/types'

export function useFFmpeg() {
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const load = useCallback(async () => {
    // Always try to load (will reuse if already loaded, or reload if terminated)
    setIsLoading(true)
    setLoadProgress(0)

    try {
      const ffmpeg = await loadFFmpeg()
      ffmpegRef.current = ffmpeg
      setIsReady(true)
      return ffmpeg
    } catch (error) {
      console.error('Failed to load FFmpeg:', error)
      setIsReady(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const transcode = useCallback(
    async (
      file: File,
      settings: TranscodeSettings,
      onProgress: (progress: Partial<TranscodeProgress>) => void
    ): Promise<Blob> => {
      // Always load first (will reload if instance was terminated)
      const ffmpeg = await load()

      if (!ffmpeg) {
        throw new Error('FFmpeg not loaded')
      }

      try {
        return await transcodeVideo(ffmpeg, file, settings, onProgress)
      } catch (error) {
        // If transcode failed due to termination, reset ready state
        const errorMsg = error instanceof Error ? error.message : String(error)
        if (errorMsg.includes('terminate') || errorMsg.includes('cancelled')) {
          setIsReady(false)
          ffmpegRef.current = null
        }
        throw error
      }
    },
    [load]
  )

  return {
    isLoading,
    isReady,
    loadProgress,
    load,
    transcode,
  }
}
