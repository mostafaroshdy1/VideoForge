import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import type { TranscodeSettings, TranscodeProgress } from '@/types'
import { getResolutionHeight } from './formats'

let ffmpegInstance: FFmpeg | null = null

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
    if (settings.qualityMode === 'crf' && settings.videoCodec.includes('x264') || settings.videoCodec.includes('x265')) {
      args.push('-crf', settings.crf.toString())
    } else if (settings.qualityMode === 'bitrate') {
      args.push('-b:v', `${settings.bitrate}k`)
    }

    // Resolution
    if (settings.resolution !== 'original') {
      const height = getResolutionHeight(settings.resolution)
      if (height) {
        args.push('-vf', `scale=-2:${height}`)
      }
    }

    // FPS
    if (settings.fps) {
      args.push('-r', settings.fps.toString())
    }

    // Preset for x264/x265
    if (settings.videoCodec.includes('x264') || settings.videoCodec.includes('x265')) {
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

export async function transcodeVideo(
  ffmpeg: FFmpeg,
  file: File,
  settings: TranscodeSettings,
  onProgress: (progress: Partial<TranscodeProgress>) => void
): Promise<Blob> {
  const inputFilename = 'input.' + file.name.split('.').pop()
  const outputFilename = `output.${settings.format}`

  // Get video duration for progress calculation
  const duration = await getVideoDuration(file)

  // Set up progress listener
  ffmpeg.on('progress', ({ progress, time }) => {
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
  })

  ffmpeg.on('log', ({ message }) => {
    const progressData = parseFFmpegProgress(message, duration)
    if (progressData) {
      onProgress(progressData)
    }
  })

  try {
    // Write input file to FFmpeg FS
    await ffmpeg.writeFile(inputFilename, await fetchFile(file))

    // Build and execute command
    const command = buildFFmpegCommand(inputFilename, outputFilename, settings)
    console.log('FFmpeg command:', ['ffmpeg', ...command].join(' '))
    
    await ffmpeg.exec(command)

    // Read output file
    const data = await ffmpeg.readFile(outputFilename)
    
    // Clean up
    await ffmpeg.deleteFile(inputFilename)
    await ffmpeg.deleteFile(outputFilename)

    // Convert to Blob
    if (typeof data === 'string') {
      const blobData = new TextEncoder().encode(data)
      return new Blob([blobData], { type: `video/${settings.format}` })
    } else {
      // Create a new ArrayBuffer from the data
      const buffer = new ArrayBuffer(data.byteLength)
      const view = new Uint8Array(buffer)
      view.set(new Uint8Array(data.buffer))
      return new Blob([buffer], { type: `video/${settings.format}` })
    }
  } catch (error) {
    // Clean up on error
    try {
      await ffmpeg.deleteFile(inputFilename)
      await ffmpeg.deleteFile(outputFilename)
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    throw error
  }
}
