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
    if (ffmpegRef.current && isReady) {
      return ffmpegRef.current
    }

    setIsLoading(true)
    setLoadProgress(0)

    try {
      const ffmpeg = await loadFFmpeg()
      ffmpegRef.current = ffmpeg
      setIsReady(true)
      return ffmpeg
    } catch (error) {
      console.error('Failed to load FFmpeg:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isReady])

  const transcode = useCallback(
    async (
      file: File,
      settings: TranscodeSettings,
      onProgress: (progress: Partial<TranscodeProgress>) => void
    ): Promise<Blob> => {
      if (!ffmpegRef.current) {
        await load()
      }

      if (!ffmpegRef.current) {
        throw new Error('FFmpeg not loaded')
      }

      return transcodeVideo(ffmpegRef.current, file, settings, onProgress)
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
