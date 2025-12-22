import { useMemo } from 'react'
import type { Artifact } from './types'

interface ArtifactDetailProps {
  artifact: Artifact
}

export function ArtifactDetail({ artifact }: ArtifactDetailProps) {
  // Extract title from markdown H1 or fall back to artifact name
  const { title, contentWithoutTitle } = useMemo(() => {
    const lines = artifact.markdownContent.split('\n')
    const h1Index = lines.findIndex(line => line.trim().startsWith('# '))

    if (h1Index !== -1) {
      const titleLine = lines[h1Index].trim()
      const extractedTitle = titleLine.slice(2)
      const remainingLines = [...lines.slice(0, h1Index), ...lines.slice(h1Index + 1)]
      return {
        title: extractedTitle,
        contentWithoutTitle: remainingLines.join('\n')
      }
    }

    return {
      title: artifact.name,
      contentWithoutTitle: artifact.markdownContent
    }
  }, [artifact.markdownContent, artifact.name])

  // Simple markdown renderer for headings, paragraphs, lists, and bold
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let currentList: string[] = []
    let listKey = 0

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300 mb-4">
            {currentList.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        )
        currentList = []
      }
    }

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // H2
      if (trimmed.startsWith('## ')) {
        flushList()
        elements.push(
          <h2
            key={index}
            className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mt-6 mb-3"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {trimmed.slice(3)}
          </h2>
        )
      }
      // H3
      else if (trimmed.startsWith('### ')) {
        flushList()
        elements.push(
          <h3
            key={index}
            className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mt-4 mb-2"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {trimmed.slice(4)}
          </h3>
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
        const text = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-zinc-900 dark:text-zinc-100">$1</strong>')
        elements.push(
          <p
            key={index}
            className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4"
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
      {/* Header with title from markdown */}
      <div className="space-y-2">
        <h1
          className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {title}
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
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }
            `}
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {type}
          </span>
        ))}
      </div>

      {/* Image preview */}
      {artifact.imagePath && (
        <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <img
            src={`artifact-file://${artifact.imagePath}`}
            alt={title}
            className="w-full h-auto"
            onError={(e) => {
              e.currentTarget.parentElement?.classList.add('hidden')
            }}
          />
        </div>
      )}


      {/* Markdown content */}
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        {renderMarkdown(contentWithoutTitle)}
      </div>
    </div>
  )
}
