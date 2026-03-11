export type VideoFormat = 'mp4' | 'webm' | 'avi' | 'mov' | 'mkv' | 'flv' | 'ogv'

export type VideoCodec = 'libx264' | 'libx265' | 'libvpx' | 'libvpx-vp9' | 'copy'

export type AudioCodec = 'aac' | 'libmp3lame' | 'libvorbis' | 'libopus' | 'copy'

export type Resolution = 'original' | '2160p' | '1440p' | '1080p' | '720p' | '480p' | '360p'

export type QualityMode = 'bitrate' | 'crf'

export interface TranscodeSettings {
  format: VideoFormat
  videoCodec: VideoCodec
  audioCodec: AudioCodec
  resolution: Resolution
  qualityMode: QualityMode
  bitrate: number // in kbps
  crf: number // 18-32
  fps?: number
  audioBitrate: number // in kbps
}

export interface VideoFile {
  id: string
  file: File
  name: string
  size: number
  duration?: number
  settings: TranscodeSettings
}

export type TranscodeStatus = 'pending' | 'processing' | 'completed' | 'error' | 'cancelled'

export interface TranscodeProgress {
  percentage: number
  currentFrame: number
  totalFrames: number
  fps: number
  speed: string
  timeElapsed: number
  timeRemaining: number
  currentSize: number
}

export interface TranscodeJob {
  id: string
  videoFile: VideoFile
  status: TranscodeStatus
  progress: TranscodeProgress
  error?: string
  outputBlob?: Blob
  outputFilename?: string
  startTime?: number
  endTime?: number
}

export interface FormatConfig {
  format: VideoFormat
  label: string
  videoCodecs: { value: VideoCodec; label: string }[]
  audioCodecs: { value: AudioCodec; label: string }[]
  defaultVideoCodec: VideoCodec
  defaultAudioCodec: AudioCodec
}
