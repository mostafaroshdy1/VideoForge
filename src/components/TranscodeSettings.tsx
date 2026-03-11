import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Slider } from './ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import type { TranscodeSettings as ITranscodeSettings, QualityMode } from '@/types'
import { formatConfigs, resolutionOptions } from '@/lib/formats'

interface TranscodeSettingsProps {
  settings: ITranscodeSettings
  onChange: (settings: ITranscodeSettings) => void
}

export function TranscodeSettings({ settings, onChange }: TranscodeSettingsProps) {
  const currentFormatConfig = formatConfigs.find((f) => f.format === settings.format)

  const handleFormatChange = (format: string) => {
    const formatConfig = formatConfigs.find((f) => f.format === format)
    if (formatConfig) {
      onChange({
        ...settings,
        format: formatConfig.format,
        videoCodec: formatConfig.defaultVideoCodec,
        audioCodec: formatConfig.defaultAudioCodec,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcode Settings</CardTitle>
        <CardDescription>
          Configure output format, quality, and resolution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-2">
          <Label htmlFor="format">Output Format</Label>
          <Select value={settings.format} onValueChange={handleFormatChange}>
            <SelectTrigger id="format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formatConfigs.map((config) => (
                <SelectItem key={config.format} value={config.format}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Video Codec */}
        <div className="space-y-2">
          <Label htmlFor="video-codec">Video Codec</Label>
          <Select
            value={settings.videoCodec}
            onValueChange={(value) =>
              onChange({ ...settings, videoCodec: value as any })
            }
          >
            <SelectTrigger id="video-codec">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentFormatConfig?.videoCodecs.map((codec) => (
                <SelectItem key={codec.value} value={codec.value}>
                  {codec.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Audio Codec */}
        <div className="space-y-2">
          <Label htmlFor="audio-codec">Audio Codec</Label>
          <Select
            value={settings.audioCodec}
            onValueChange={(value) =>
              onChange({ ...settings, audioCodec: value as any })
            }
          >
            <SelectTrigger id="audio-codec">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentFormatConfig?.audioCodecs.map((codec) => (
                <SelectItem key={codec.value} value={codec.value}>
                  {codec.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resolution */}
        <div className="space-y-2">
          <Label htmlFor="resolution">Resolution</Label>
          <Select
            value={settings.resolution}
            onValueChange={(value) =>
              onChange({ ...settings, resolution: value as any })
            }
          >
            <SelectTrigger id="resolution">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {resolutionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quality Settings */}
        {settings.videoCodec !== 'copy' && (
          <div className="space-y-4">
            <Tabs
              value={settings.qualityMode}
              onValueChange={(value) =>
                onChange({ ...settings, qualityMode: value as QualityMode })
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="crf">CRF (Quality)</TabsTrigger>
                <TabsTrigger value="bitrate">Bitrate</TabsTrigger>
              </TabsList>

              <TabsContent value="crf" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="crf">CRF Value: {settings.crf}</Label>
                    <span className="text-xs text-muted-foreground">
                      {settings.crf < 20
                        ? 'Very High'
                        : settings.crf < 24
                        ? 'High'
                        : settings.crf < 28
                        ? 'Medium'
                        : 'Low'}
                    </span>
                  </div>
                  <Slider
                    id="crf"
                    min={18}
                    max={32}
                    step={1}
                    value={[settings.crf]}
                    onValueChange={([value]) =>
                      onChange({ ...settings, crf: value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower = better quality, larger file. Recommended: 23
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="bitrate" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bitrate">
                      Video Bitrate: {settings.bitrate} kbps
                    </Label>
                  </div>
                  <Slider
                    id="bitrate"
                    min={500}
                    max={50000}
                    step={500}
                    value={[settings.bitrate]}
                    onValueChange={([value]) =>
                      onChange({ ...settings, bitrate: value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher = better quality, larger file. Recommended: 5000
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Audio Bitrate */}
        {settings.audioCodec !== 'copy' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="audio-bitrate">
                Audio Bitrate: {settings.audioBitrate} kbps
              </Label>
            </div>
            <Slider
              id="audio-bitrate"
              min={64}
              max={320}
              step={32}
              value={[settings.audioBitrate]}
              onValueChange={([value]) =>
                onChange({ ...settings, audioBitrate: value })
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
