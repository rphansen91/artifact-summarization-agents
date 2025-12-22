import type { WeekListProps } from '../types'
import { WeekCard } from './WeekCard'

export function WeekList({
  weeks,
  onViewWeek,
  onGenerateSummary,
  onStartChat
}: WeekListProps) {
  // Group weeks by year for better organization
  const weeksByYear = weeks.reduce((acc, week) => {
    if (!acc[week.year]) {
      acc[week.year] = []
    }
    acc[week.year].push(week)
    return acc
  }, {} as Record<number, typeof weeks>)

  const years = Object.keys(weeksByYear)
    .map(Number)
    .sort((a, b) => b - a)

  const totalArtifacts = weeks.reduce((sum, w) => sum + w.artifactCount, 0)
  const summarizedCount = weeks.filter(w => w.summary.status === 'generated').length

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Page Header */}
      <header className="border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Contextualize
              </h1>
              <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl">
                AI-powered summaries and insights from your weekly work artifacts
              </p>
            </div>

            {/* Summary Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                  {totalArtifacts}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400">artifacts</p>
              </div>
              <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700" />
              <div className="text-center">
                <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {summarizedCount}/{weeks.length}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400">summarized</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {weeks.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <svg className="w-10 h-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              No weeks captured yet
            </h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Start capturing artifacts and they'll be organized by week here for summarization
            </p>
          </div>
        ) : (
          /* Week Grid by Year */
          <div className="space-y-12">
            {years.map((year) => (
              <section key={year}>
                {/* Year Header */}
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {year}
                  </h2>
                  <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                  <span className="text-sm text-zinc-400 dark:text-zinc-500">
                    {weeksByYear[year].length} weeks
                  </span>
                </div>

                {/* Week Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {weeksByYear[year].map((week) => (
                    <WeekCard
                      key={week.id}
                      week={week}
                      onView={() => onViewWeek?.(week.id)}
                      onGenerateSummary={() => onGenerateSummary?.(week.id)}
                      onStartChat={() => onStartChat?.(week.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
