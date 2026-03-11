<div align="center">
  <h1>🎬 Video Transcoder</h1>
  <p><strong>Convert videos in your browser - fast, private, and free</strong></p>
  
  <p>
    <a href="https://mostafaroshdy1.github.io/VideoForge/" target="_blank"><strong>🚀 Try Live Demo</strong></a> •
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#usage">Usage</a> •
    <a href="#supported-formats">Formats</a> •
    <a href="#troubleshooting">Troubleshooting</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-18-61dafb?logo=react" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-5-646cff?logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
  </p>
  
  <p>
    <a href="https://mostafaroshdy1.github.io/VideoForge/" target="_blank">
      <img src="https://img.shields.io/badge/demo-live-success?style=for-the-badge" alt="Live Demo" />
    </a>
  </p>
</div>

---

## 📖 About

A powerful, **privacy-first** video transcoding application that runs entirely in your browser. Built with React and powered by FFmpeg.wasm, it offers professional-grade video conversion without ever uploading your files to a server.

**🔒 Your files never leave your device** - All processing happens locally using WebAssembly technology.

## ✨ Features

### 🎥 Video Processing
- **7 Output Formats**: MP4, WebM, AVI, MOV, MKV, FLV, OGV
- **Multiple Codecs**: H.264, H.265 (HEVC), VP8, VP9, and more
- **Resolution Scaling**: 360p to 4K (2160p) or keep original
- **Quality Control**: CRF (Constant Rate Factor) or bitrate modes
- **Batch Processing**: Queue and process multiple videos sequentially
- **Cancel Anytime**: Abort current transcoding with one click

### 📊 Progress Tracking
- Real-time percentage and time estimates
- FPS (frames per second) monitoring
- Processing speed indicator
- Current/total frame count
- Live file size updates

### 🎨 User Experience
- **Beautiful Dark UI**: Modern interface built with shadcn/ui
- **Drag & Drop**: Easy file uploading
- **Auto-Download**: Completed videos download automatically
- **Error Handling**: Clear error messages and troubleshooting guides
- **Responsive Design**: Works on desktop and tablets

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **FFmpeg.wasm** for video processing
- **Zustand** for state management
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Upload Videos**: Drag and drop video files or click to select
2. **Configure Settings**:
   - Choose output format (MP4, WebM, etc.)
   - Select video and audio codecs
   - Adjust resolution (or keep original)
   - Set quality using CRF (18-32) or bitrate (500-50000 kbps)
   - Adjust audio bitrate (64-320 kbps)
3. **Start Transcoding**: Click the "Start Transcoding" button
4. **Monitor Progress**: Watch detailed progress including FPS, speed, and time remaining
5. **Auto-Download**: Videos automatically download when complete

## Supported Formats

### Input
- Any video format supported by your browser

### Output
- **MP4**: H.264, H.265 (HEVC)
- **WebM**: VP9, VP8
- **MKV**: H.264, H.265, VP9
- **AVI**: H.264
- **MOV**: H.264, H.265
- **FLV**: H.264
- **OGV**: VP8

## Quality Settings

### CRF Mode (Recommended)
- Lower = Better quality, larger file
- **18-20**: Very high quality
- **23**: Recommended default (good balance)
- **28-32**: Lower quality, smaller file

### Bitrate Mode
- Higher = Better quality, larger file
- **500-2000 kbps**: Low quality
- **5000 kbps**: Recommended default
- **10000+ kbps**: High quality

## Performance Notes

- Processing is CPU-intensive and runs entirely in your browser
- Larger videos take longer to process
- Recommended maximum file size: ~2GB (browser memory limitation)
- Processing speed depends on your device's CPU performance

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── FileUploader.tsx
│   ├── TranscodeSettings.tsx
│   ├── ProgressCard.tsx
│   ├── ProcessingQueue.tsx
│   └── Header.tsx
├── hooks/              # Custom React hooks
│   └── useFFmpeg.ts
├── lib/                # Utilities and configurations
│   ├── ffmpeg.ts       # FFmpeg wrapper
│   ├── formats.ts      # Format/codec configs
│   └── utils.ts        # Helper functions
├── store/              # State management
│   └── transcodeStore.ts
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

### Adding New Features

To add a new output format:

1. Add the format to `types/index.ts`
2. Add format configuration in `lib/formats.ts`
3. The UI will automatically pick up the new format

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 90+
- Safari 15+

Requires browsers with SharedArrayBuffer support and CORS isolation headers.

## Troubleshooting

### FFmpeg Failed to Load

If you see "Failed to load FFmpeg" error:

1. **Refresh the page** - Sometimes the CDN takes time to load
2. **Check your internet connection** - FFmpeg.wasm is loaded from a CDN (~30MB)
3. **Try a different browser** - Use Chrome, Firefox, or Edge (latest versions)
4. **Disable browser extensions** - Some extensions block CDN content
5. **Check browser console** - Look for CORS or network errors
6. **Clear browser cache** - Sometimes cached files get corrupted

### Videos Not Processing

1. **File size** - Keep files under 2GB for best results
2. **Format support** - Make sure your input video is a valid format
3. **Browser memory** - Close other tabs to free up memory
4. **Check progress** - Processing can take time for large files

### Slow Processing

- Processing speed depends on your CPU
- Use lower resolution or higher CRF for faster encoding
- Consider using "Copy" codec if you just want to change the container format

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) for making FFmpeg available in the browser
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling

