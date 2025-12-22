import { FileImage } from 'lucide-react'
import type { Artifact } from '../types'

interface ArtifactDetailProps {
  artifact: Artifact
}

export function ArtifactDetail({ artifact }: ArtifactDetailProps) {
  // Simple markdown renderer for headings, paragraphs, lists, and bold
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let currentList: string[] = []
    let listKey = 0

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-1 text-zinc-300 mb-4">
            {currentList.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">{item}</li>
            ))}
          </ul>
        )
        currentList = []
      }
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // H1
      if (trimmed.startsWith('# ')) {
        flushList()
        elements.push(
          <h1
            key={index}
            className="text-2xl font-bold text-emerald-400 mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {trimmed.slice(2)}
          </h1>
        )
      }
      // H2
      else if (trimmed.startsWith('## ')) {
        flushList()
        elements.push(
          <h2
            key={index}
            className="text-lg font-semibold text-zinc-200 mt-6 mb-3"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {trimmed.slice(3)}
          </h2>
        )
      }
      // List item
      else if (trimmed.startsWith('- ')) {
        // Handle bold text in list items
        const text = trimmed.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        currentList.push(text)
      }
      // Empty line
      else if (trimmed === '') {
        flushList()
      }
      // Paragraph
      else {
        flushList()
        // Handle bold text
        const text = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-zinc-100">$1</strong>')
        elements.push(
          <p
            key={index}
            className="text-sm text-zinc-300 leading-relaxed mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )
      }
    })

    flushList()
    return elements
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1
          className="text-2xl font-bold text-zinc-100"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {artifact.name}
        </h1>
        <p
          className="text-sm text-zinc-500"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {artifact.fileTypes.length} related files
        </p>
      </div>

      {/* File type badges */}
      <div className="flex gap-2">
        {artifact.fileTypes.map(type => (
          <span
            key={type}
            className={`
              px-3 py-1 text-sm rounded-lg
              ${type === '.png'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }
            `}
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {type}
          </span>
        ))}
      </div>

      {/* Two-column layout for image and markdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image preview card */}
        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span
              className="text-xs text-zinc-500 ml-2 truncate"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {artifact.name}.png
            </span>
          </div>

          {/* Image placeholder */}
          <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                <FileImage className="w-16 h-16 text-zinc-600 relative" />
              </div>
              <p
                className="text-xs text-zinc-600 mt-3"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Screenshot preview
              </p>
            </div>
          </div>
        </div>

        {/* Markdown preview card */}
        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span
              className="text-xs text-zinc-500 ml-2 truncate"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {artifact.name}.md
            </span>
          </div>

          {/* Markdown content */}
          <div className="p-6 max-h-[500px] overflow-y-auto">
            {renderMarkdown(artifact.markdownContent)}
          </div>
        </div>
      </div>
    </div>
  )
}
