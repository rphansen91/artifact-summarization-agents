import { useState, useEffect } from 'react'
import { Sparkles, MessageSquare, FolderOpen, Loader2, Code, Terminal, Cpu, Boxes, Bot, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import type { FolderNode } from './types'

interface WeekStats {
  commits: number
  screenshots: number
  ideas: number
  topCategory: string
}

interface WeekSummary {
  status: 'pending' | 'generating' | 'generated'
  generatedAt: string | null
  narrative: string | null
  fullContent: string | null
  highlights: string[]
  stats: WeekStats
}

interface Week {
  id: string
  label: string
  dateRange: string
  year: number
  artifactCount: number
  categories: string[]
  summary: WeekSummary
  threadCount: number
}

interface WeekDetailViewProps {
  weekId: string
  weekNode: FolderNode
  onSelectCategory: (categoryId: string) => void
  onGenerateSummary?: () => void
  onStartChat?: () => void
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '1-Code': Code,
  '2-Terminal': Terminal,
  '3-Performance': Cpu,
  '4-Architecture': Boxes,
  '5-AI_Agents': Bot,
}

export function WeekDetailView({
  weekId,
  weekNode,
  onSelectCategory,
  onGenerateSummary,
  onStartChat,
}: WeekDetailViewProps) {
  const [week, setWeek] = useState<Week | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullSummary, setShowFullSummary] = useState(false)

  useEffect(() => {
    async function loadWeekDetails() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await window.electronAPI.getWeekById(weekId)
        if (result.success && result.week) {
          setWeek(result.week)
        } else {
          setError(result.error || 'Failed to load week details')
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    loadWeekDetails()
  }, [weekId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-zinc-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            Loading week details...
          </p>
        </div>
      </div>
    )
  }

  if (error || !week) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-200" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Failed to load week
            </h3>
            <p className="text-sm text-zinc-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {error || 'Week not found'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const hasSummary = week.summary.status === 'generated'
  const isPending = week.summary.status === 'pending'
  const isGenerating = week.summary.status === 'generating'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Week Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {week.label}
              </h1>
              <span className="text-sm text-zinc-400 dark:text-zinc-500 font-mono">
                {week.year}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              {week.dateRange}
            </p>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {hasSummary ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Summarized
              </span>
            ) : isGenerating ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Generating...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                Pending
              </span>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 dark:text-zinc-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
            </span>
            <span className="text-zinc-600 dark:text-zinc-300 font-mono">{week.summary.stats.commits}</span>
            <span className="text-zinc-400 dark:text-zinc-500">commits</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 dark:text-zinc-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </span>
            <span className="text-zinc-600 dark:text-zinc-300 font-mono">{week.summary.stats.screenshots}</span>
            <span className="text-zinc-400 dark:text-zinc-500">captures</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 dark:text-zinc-500">
              <FolderOpen className="w-4 h-4" />
            </span>
            <span className="text-zinc-600 dark:text-zinc-300 font-mono">{week.artifactCount}</span>
            <span className="text-zinc-400 dark:text-zinc-500">artifacts</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3">
          {isPending && (
            <button
              onClick={onGenerateSummary}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Generate Summary
            </button>
          )}
          {isGenerating && (
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-400 text-white rounded-lg cursor-not-allowed"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </button>
          )}
          <button
            onClick={onStartChat}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
            {week.threadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded">
                {week.threadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Summary Section */}
      {hasSummary && week.summary.narrative && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Summary
            </h2>
            {week.summary.fullContent && (
              <button
                onClick={() => setShowFullSummary(!showFullSummary)}
                className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                {showFullSummary ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Read full summary
                  </>
                )}
              </button>
            )}
          </div>

          {showFullSummary && week.summary.fullContent ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {/* Render markdown content as formatted text */}
              {week.summary.fullContent.split('\n').map((line, idx) => {
                const trimmed = line.trim()

                // Headers
                if (trimmed.startsWith('# ')) {
                  return (
                    <h1 key={idx} className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-6 mb-3">
                      {trimmed.slice(2)}
                    </h1>
                  )
                }
                if (trimmed.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-5 mb-2">
                      {trimmed.slice(3)}
                    </h2>
                  )
                }
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4 mb-2">
                      {trimmed.slice(4)}
                    </h3>
                  )
                }

                // Bullet points
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  return (
                    <div key={idx} className="flex items-start gap-2 ml-4 my-1">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{trimmed.slice(2)}</span>
                    </div>
                  )
                }

                // Empty lines
                if (!trimmed) {
                  return <div key={idx} className="h-2" />
                }

                // Regular paragraphs
                return (
                  <p key={idx} className="my-2 leading-relaxed">
                    {trimmed}
                  </p>
                )
              })}
            </div>
          ) : (
            <>
              <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                {week.summary.narrative}
              </p>

              {week.summary.highlights.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                    Highlights
                  </h3>
                  <ul className="space-y-2">
                    {week.summary.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-zinc-600 dark:text-zinc-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Categories
        </h2>

        {weekNode.children && weekNode.children.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weekNode.children.map((category) => {
              const IconComponent = categoryIcons[category.name] || FileText
              const displayName = category.name.replace(/^\d+-/, '').replace('_', ' ')

              return (
                <button
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {displayName}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {category.itemCount || 0} artifact{(category.itemCount || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              No categories found for this week
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
