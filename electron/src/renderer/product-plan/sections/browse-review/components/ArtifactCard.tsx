import { FileImage } from 'lucide-react'
import type { Artifact } from '../types'

interface ArtifactCardProps {
  artifact: Artifact
  viewMode: 'grid' | 'list'
  onSelect?: () => void
}

export function ArtifactCard({ artifact, viewMode, onSelect }: ArtifactCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (viewMode === 'list') {
    return (
      <button
        onClick={onSelect}
        className="
          group flex items-center gap-4 w-full p-3 rounded-lg
          bg-zinc-800/30 hover:bg-zinc-800/60
          border border-zinc-800 hover:border-zinc-700
          transition-all duration-150
          text-left
        "
      >
        {/* Thumbnail */}
        <div className="w-16 h-12 rounded-md bg-zinc-900 overflow-hidden flex-shrink-0 border border-zinc-700">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <FileImage className="w-5 h-5 text-zinc-600" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-medium text-zinc-200 truncate group-hover:text-emerald-400 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {artifact.name}
          </h3>
          <p
            className="text-xs text-zinc-500 mt-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {artifact.categoryName} &middot; {formatDate(artifact.createdAt)}
          </p>
        </div>

        {/* File type badges */}
        <div className="flex gap-1.5 flex-shrink-0">
          {artifact.fileTypes.map(type => (
            <span
              key={type}
              className="
                px-2 py-0.5 text-xs rounded
                bg-zinc-700/50 text-zinc-400
                border border-zinc-700
              "
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {type}
            </span>
          ))}
        </div>
      </button>
    )
  }

  // Grid view
  return (
    <button
      onClick={onSelect}
      className="
        group flex flex-col w-full rounded-xl overflow-hidden
        bg-zinc-800/30 hover:bg-zinc-800/60
        border border-zinc-800 hover:border-zinc-700
        transition-all duration-200
        text-left
        hover:shadow-lg hover:shadow-black/20
        hover:-translate-y-0.5
      "
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full" />
            <FileImage className="w-12 h-12 text-zinc-600 relative" />
          </div>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-200" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="text-sm font-medium text-zinc-200 truncate group-hover:text-emerald-400 transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {artifact.name}
        </h3>
        <p
          className="text-xs text-zinc-500 mt-1 line-clamp-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {artifact.title}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
          <span
            className="text-xs text-zinc-500"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {formatDate(artifact.createdAt)}
          </span>
          <div className="flex gap-1">
            {artifact.fileTypes.map(type => (
              <span
                key={type}
                className="
                  px-1.5 py-0.5 text-xs rounded
                  bg-zinc-700/50 text-zinc-400
                "
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}
