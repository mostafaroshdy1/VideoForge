import { Film } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Film className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Video Transcoder</h1>
            <p className="text-sm text-muted-foreground">
              Convert and compress videos in your browser
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
