import { FileImage } from 'lucide-react'
import type { Artifact } from './types'

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
          bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/60
          border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700
          transition-all duration-150
          text-left
        "
      >
        {/* Thumbnail - only show if image exists */}
        {artifact.imagePath && (
          <div className="w-16 h-12 rounded-md bg-zinc-200 dark:bg-zinc-900 overflow-hidden flex-shrink-0 border border-zinc-300 dark:border-zinc-700">
            <img
              src={`artifact-file://${artifact.imagePath}`}
              alt={artifact.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {artifact.title}
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
                bg-zinc-200 text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-400
                border border-zinc-300 dark:border-zinc-700
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
        bg-white hover:bg-zinc-50 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/60
        border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700
        transition-all duration-200
        text-left
        hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20
        hover:-translate-y-0.5
      "
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
        {artifact.imagePath ? (
          <img
            src={`artifact-file://${artifact.imagePath}`}
            alt={artifact.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-300 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-950 ${artifact.imagePath ? 'hidden' : ''}`}>
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full" />
            <FileImage className="w-12 h-12 text-zinc-400 dark:text-zinc-600 relative" />
          </div>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-200" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="text-sm font-medium text-emerald-600 dark:text-emerald-400 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {artifact.title}
        </h3>
        <p
          className="text-xs text-zinc-500 mt-1"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {artifact.categoryName} &middot; {formatDate(artifact.createdAt)}
        </p>

        {/* File type badges */}
        <div className="flex gap-1 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          {artifact.fileTypes.map(type => (
            <span
              key={type}
              className="
                px-1.5 py-0.5 text-xs rounded
                bg-zinc-200 text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-400
              "
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}
