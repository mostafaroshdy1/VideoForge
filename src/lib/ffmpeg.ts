import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import type { TranscodeSettings, TranscodeProgress } from '@/types'
import { getResolutionHeight } from './formats'

let ffmpegInstance: FFmpeg | null = null
let isTranscoding = false

export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance
  }

  const ffmpeg = new FFmpeg()

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message)
  })

  try {
    console.log('Loading FFmpeg...')
    
    // Use CDN URLs - try multiple sources
    const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'
    
    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
    
    await ffmpeg.load({
      coreURL,
      wasmURL,
      workerURL,
    })

    console.log('FFmpeg loaded successfully!')
    ffmpegInstance = ffmpeg
    return ffmpeg
  } catch (error) {
    console.error('Failed to load FFmpeg:', error)
    throw new Error(
      'Failed to load FFmpeg. This could be due to browser restrictions or network issues. ' +
      'Please ensure you are using a modern browser (Chrome, Firefox, or Edge) and have a stable internet connection.'
    )
  }
}

export function buildFFmpegCommand(
  inputFilename: string,
  outputFilename: string,
  settings: TranscodeSettings
): string[] {
  const args: string[] = ['-i', inputFilename]

  // Video codec
  if (settings.videoCodec !== 'copy') {
    args.push('-c:v', settings.videoCodec)

    // Quality settings
    const isX264Or265 = settings.videoCodec.includes('x264') || settings.videoCodec.includes('x265')
    if (settings.qualityMode === 'crf' && isX264Or265) {
      args.push('-crf', settings.crf.toString())
    } else if (settings.qualityMode === 'bitrate') {
      args.push('-b:v', `${settings.bitrate}k`)
    }

    // Resolution - ensure even dimensions for H.264/H.265
    if (settings.resolution !== 'original') {
      const height = getResolutionHeight(settings.resolution)
      if (height) {
        // Use scale filter with forced even dimensions (required for H.264/H.265)
        args.push('-vf', `scale=-2:${height}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`)
      }
    }

    // FPS
    if (settings.fps) {
      args.push('-r', settings.fps.toString())
    }

    // Preset for x264/x265 - use faster preset for better performance
    if (isX264Or265) {
      args.push('-preset', 'medium')
    }
  } else {
    args.push('-c:v', 'copy')
  }

  // Audio codec
  if (settings.audioCodec !== 'copy') {
    args.push('-c:a', settings.audioCodec)
    args.push('-b:a', `${settings.audioBitrate}k`)
  } else {
    args.push('-c:a', 'copy')
  }

  // Output
  args.push(outputFilename)

  return args
}

export function parseFFmpegProgress(
  message: string,
  duration: number
): Partial<TranscodeProgress> | null {
  // Parse frame=  123 fps= 45 q=28.0 size=    1024kB time=00:00:05.12 bitrate=1638.4kbits/s speed=1.23x
  const frameMatch = message.match(/frame=\s*(\d+)/)
  const fpsMatch = message.match(/fps=\s*([\d.]+)/)
  const sizeMatch = message.match(/size=\s*(\d+)kB/)
  const timeMatch = message.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/)
  const speedMatch = message.match(/speed=\s*([\d.]+)x/)

  if (!timeMatch) return null

  const hours = parseInt(timeMatch[1])
  const minutes = parseInt(timeMatch[2])
  const seconds = parseFloat(timeMatch[3])
  const currentTime = hours * 3600 + minutes * 60 + seconds

  const percentage = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0

  const fps = fpsMatch ? parseFloat(fpsMatch[1]) : 0
  const speed = speedMatch ? speedMatch[1] : '0'
  const currentSize = sizeMatch ? parseInt(sizeMatch[1]) * 1024 : 0
  const currentFrame = frameMatch ? parseInt(frameMatch[1]) : 0

  const timeElapsed = currentTime
  const timeRemaining = duration > currentTime ? duration - currentTime : 0
  const totalFrames = duration > 0 && fps > 0 ? Math.floor(duration * fps) : 0

  return {
    percentage: Math.round(percentage * 100) / 100,
    currentFrame,
    totalFrames,
    fps,
    speed,
    timeElapsed,
    timeRemaining,
    currentSize,
  }
}

export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }

    video.onerror = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(0)
    }

    video.src = URL.createObjectURL(file)
  })
}

export function abortTranscoding(): void {
  isTranscoding = false
  if (ffmpegInstance) {
    try {
      // Terminate FFmpeg instance to stop current processing
      ffmpegInstance.terminate()
      ffmpegInstance = null
      console.log('Transcoding aborted')
    } catch (error) {
      console.error('Error aborting transcoding:', error)
    }
  }
}

export async function transcodeVideo(
  ffmpeg: FFmpeg,
  file: File,
  settings: TranscodeSettings,
  onProgress: (progress: Partial<TranscodeProgress>) => void
): Promise<Blob> {
  const inputFilename = 'input.' + file.name.split('.').pop()
  const outputFilename = `output.${settings.format}`

  isTranscoding = true

  // Get video duration for progress calculation
  const duration = await getVideoDuration(file)

  // Progress handler with memoized callback
  const progressHandler = ({ progress, time }: { progress: number; time: number }) => {
    if (duration > 0) {
      const currentTime = time / 1000000 // Convert microseconds to seconds
      const percentage = Math.min((currentTime / duration) * 100, 100)
      onProgress({
        percentage: Math.round(percentage * 100) / 100,
        timeElapsed: currentTime,
        timeRemaining: duration - currentTime,
      })
    } else {
      onProgress({
        percentage: Math.round(progress * 100),
      })
    }
  }

  // Log handler for detailed progress
  const logHandler = ({ message }: { message: string }) => {
    const progressData = parseFFmpegProgress(message, duration)
    if (progressData) {
      onProgress(progressData)
    }
  }

  // Set up listeners
  ffmpeg.on('progress', progressHandler)
  ffmpeg.on('log', logHandler)

  try {
    // Write input file to FFmpeg FS
    await ffmpeg.writeFile(inputFilename, await fetchFile(file))

    // Build and execute command
    const command = buildFFmpegCommand(inputFilename, outputFilename, settings)
    console.log('FFmpeg command:', ['ffmpeg', ...command].join(' '))
    
    await ffmpeg.exec(command)

    // Check if transcoding was aborted
    if (!isTranscoding) {
      throw new Error('Transcoding was aborted')
    }

    // Read output file
    const data = await ffmpeg.readFile(outputFilename)
    
    // Clean up files
    await Promise.all([
      ffmpeg.deleteFile(inputFilename).catch(() => {}),
      ffmpeg.deleteFile(outputFilename).catch(() => {})
    ])

    isTranscoding = false

    // Convert to Blob efficiently
    if (data instanceof Uint8Array) {
      return new Blob([data.slice()], { type: `video/${settings.format}` })
    } else {
      const blobData = new TextEncoder().encode(data)
      return new Blob([blobData], { type: `video/${settings.format}` })
    }
  } catch (error) {
    isTranscoding = false
    // Clean up on error
    await Promise.all([
      ffmpeg.deleteFile(inputFilename).catch(() => {}),
      ffmpeg.deleteFile(outputFilename).catch(() => {})
    ])
    throw error
  } finally {
    // Remove listeners
    ffmpeg.off('progress', progressHandler)
    ffmpeg.off('log', logHandler)
  }
}
