# Testing the Video Transcoder

## Quick Start

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## What to Test

1. **Initial Load**
   - App should load with dark theme
   - Header should show "Video Transcoder"
   - File upload area should be visible
   - Settings panel should show default options (MP4, H.264, CRF 23, etc.)

2. **FFmpeg Loading** (happens on first transcode)
   - When you click "Start Transcoding", FFmpeg will load
   - Should see "Loading FFmpeg..." button state
   - Watch browser console for "[FFmpeg]" logs
   - If successful, should see "FFmpeg loaded successfully!"

3. **File Upload**
   - Drag & drop a video file
   - OR click "Select Files" button
   - File should appear in the list with size

4. **Settings**
   - Change output format (MP4, WebM, etc.)
   - Adjust quality (CRF slider or bitrate)
   - Change resolution
   - Select different codecs

5. **Transcoding**
   - Click "Start Transcoding"
   - Progress card should show:
     - Percentage complete
     - FPS, speed, frames
     - Time elapsed/remaining
   - When complete, file should auto-download

## Common Issues

### "Failed to load FFmpeg"
- Check browser console for details
- Try refreshing the page
- Make sure you have internet connection (CDN download)
- Try Chrome/Firefox/Edge latest version

### Video not processing
- Check file size (under 2GB recommended)
- Check browser console for errors
- Make sure it's a valid video file

### Slow processing
- Normal! Video transcoding is CPU-intensive
- Try smaller files first (few seconds, under 10MB)
- Lower resolution = faster processing
