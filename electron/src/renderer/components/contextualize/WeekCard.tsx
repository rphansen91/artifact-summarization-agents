import type { WeekCardProps } from './types'

export function WeekCard({
  week,
  onView,
  onGenerateSummary,
  onStartChat
}: WeekCardProps) {
  const hasSummary = week.summary.status === 'generated'
  const isPending = week.summary.status === 'pending'
  const isGenerating = week.summary.status === 'generating'

  return (
    <article
      className="group relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10"
    >
      {/* Week Header */}
      <header className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {week.label}
              </h3>
              <span className="text-sm text-zinc-400 dark:text-zinc-500 font-mono">
                {week.year}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
      </header>

      {/* Stats Row */}
      <div className="px-5 py-3 bg-zinc-100/50 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-6 text-sm">
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </span>
            <span className="text-zinc-600 dark:text-zinc-300 font-mono">{week.summary.stats.ideas}</span>
            <span className="text-zinc-400 dark:text-zinc-500">ideas</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {hasSummary && week.summary.narrative ? (
          <>
            {/* Narrative */}
            <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed line-clamp-3">
              {week.summary.narrative}
            </p>

            {/* Highlights */}
            {week.summary.highlights.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Highlights
                </h4>
                <ul className="space-y-1.5">
                  {week.summary.highlights.slice(0, 3).map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-zinc-600 dark:text-zinc-300">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Categories */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {week.categories.map((category) => (
                <span
                  key={category}
                  className="px-2 py-0.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded"
                >
                  {category.replace('_', ' ')}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM19.5 10.5l-1.125-.375a3 3 0 0 1-1.875-1.875L16.125 7.5l.375 1.125a3 3 0 0 1-1.875 1.875L13.5 10.875l1.125.375a3 3 0 0 1 1.875 1.875l.375 1.125.375-1.125a3 3 0 0 1 1.875-1.875l1.125-.375-.75-.375Z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {week.artifactCount} artifacts captured
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Generate a summary to see insights
            </p>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <footer className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
        <div className="flex items-center justify-between gap-3">
          {/* Left: View Details */}
          <button
            onClick={onView}
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            View details →
          </button>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {!hasSummary && (
              <button
                onClick={onGenerateSummary}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                {isGenerating ? 'Generating...' : 'Summarize'}
              </button>
            )}

            <button
              onClick={onStartChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
              Chat
              {week.threadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded">
                  {week.threadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </footer>
    </article>
  )
}
