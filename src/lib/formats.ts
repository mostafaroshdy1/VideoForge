import type { FormatConfig, Resolution, TranscodeSettings } from '@/types'

export const formatConfigs: FormatConfig[] = [
  {
    format: 'mp4',
    label: 'MP4 (H.264)',
    videoCodecs: [
      { value: 'libx264', label: 'H.264' },
      { value: 'libx265', label: 'H.265 (HEVC)' },
      { value: 'copy', label: 'Copy (no re-encode)' },
    ],
    audioCodecs: [
      { value: 'aac', label: 'AAC' },
      { value: 'libmp3lame', label: 'MP3' },
      { value: 'copy', label: 'Copy' },
    ],
    defaultVideoCodec: 'libx264',
    defaultAudioCodec: 'aac',
  },
  {
    format: 'webm',
    label: 'WebM (VP9)',
    videoCodecs: [
      { value: 'libvpx-vp9', label: 'VP9' },
      { value: 'libvpx', label: 'VP8' },
    ],
    audioCodecs: [
      { value: 'libopus', label: 'Opus' },
      { value: 'libvorbis', label: 'Vorbis' },
    ],
    defaultVideoCodec: 'libvpx-vp9',
    defaultAudioCodec: 'libopus',
  },
  {
    format: 'mkv',
    label: 'MKV (Matroska)',
    videoCodecs: [
      { value: 'libx264', label: 'H.264' },
      { value: 'libx265', label: 'H.265 (HEVC)' },
      { value: 'libvpx-vp9', label: 'VP9' },
      { value: 'copy', label: 'Copy' },
    ],
    audioCodecs: [
      { value: 'aac', label: 'AAC' },
      { value: 'libopus', label: 'Opus' },
      { value: 'libmp3lame', label: 'MP3' },
      { value: 'copy', label: 'Copy' },
    ],
    defaultVideoCodec: 'libx264',
    defaultAudioCodec: 'aac',
  },
  {
    format: 'avi',
    label: 'AVI',
    videoCodecs: [
      { value: 'libx264', label: 'H.264' },
    ],
    audioCodecs: [
      { value: 'libmp3lame', label: 'MP3' },
      { value: 'aac', label: 'AAC' },
    ],
    defaultVideoCodec: 'libx264',
    defaultAudioCodec: 'libmp3lame',
  },
  {
    format: 'mov',
    label: 'MOV (QuickTime)',
    videoCodecs: [
      { value: 'libx264', label: 'H.264' },
      { value: 'libx265', label: 'H.265 (HEVC)' },
    ],
    audioCodecs: [
      { value: 'aac', label: 'AAC' },
    ],
    defaultVideoCodec: 'libx264',
    defaultAudioCodec: 'aac',
  },
  {
    format: 'flv',
    label: 'FLV (Flash Video)',
    videoCodecs: [
      { value: 'libx264', label: 'H.264' },
    ],
    audioCodecs: [
      { value: 'aac', label: 'AAC' },
      { value: 'libmp3lame', label: 'MP3' },
    ],
    defaultVideoCodec: 'libx264',
    defaultAudioCodec: 'aac',
  },
  {
    format: 'ogv',
    label: 'OGV (Ogg Video)',
    videoCodecs: [
      { value: 'libvpx', label: 'VP8' },
    ],
    audioCodecs: [
      { value: 'libvorbis', label: 'Vorbis' },
    ],
    defaultVideoCodec: 'libvpx',
    defaultAudioCodec: 'libvorbis',
  },
]

export const resolutionOptions: { value: Resolution; label: string; height?: number }[] = [
  { value: 'original', label: 'Original' },
  { value: '2160p', label: '4K (2160p)', height: 2160 },
  { value: '1440p', label: '2K (1440p)', height: 1440 },
  { value: '1080p', label: 'Full HD (1080p)', height: 1080 },
  { value: '720p', label: 'HD (720p)', height: 720 },
  { value: '480p', label: 'SD (480p)', height: 480 },
  { value: '360p', label: 'Low (360p)', height: 360 },
]

export const defaultSettings: TranscodeSettings = {
  format: 'mp4',
  videoCodec: 'libx264',
  audioCodec: 'aac',
  resolution: 'original',
  qualityMode: 'crf',
  bitrate: 5000,
  crf: 23,
  audioBitrate: 192,
}

export function getResolutionHeight(resolution: Resolution): number | null {
  const option = resolutionOptions.find(r => r.value === resolution)
  return option?.height ?? null
}

export function getFormatConfig(format: string): FormatConfig | undefined {
  return formatConfigs.find(f => f.format === format)
}
