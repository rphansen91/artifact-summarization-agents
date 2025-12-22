import type { ChatThread, Week } from '../types'

interface ThreadSidebarProps {
  week: Week
  threads: ChatThread[]
  activeThreadId: string | null
  onSelectThread?: (threadId: string) => void
  onCreateThread?: () => void
  onBack?: () => void
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ThreadSidebar({
  week,
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
  onBack
}: ThreadSidebarProps) {
  return (
    <aside className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="shrink-0 p-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mb-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to weeks
        </button>

        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {week.label}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {week.dateRange}
          </p>
        </div>

        {/* Week Stats Mini */}
        <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            {week.artifactCount} artifacts
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            {threads.length} threads
          </span>
        </div>
      </header>

      {/* New Thread Button */}
      <div className="shrink-0 p-3">
        <button
          onClick={onCreateThread}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New conversation
        </button>
      </div>

      {/* Thread List */}
      <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
        {threads.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No conversations yet
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Start one to ask about this week
            </p>
          </div>
        ) : (
          threads.map((thread) => {
            const isActive = thread.id === activeThreadId
            return (
              <button
                key={thread.id}
                onClick={() => onSelectThread?.(thread.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent'
                }`}
              >
                <p className={`text-sm font-medium truncate ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-zinc-800 dark:text-zinc-200'
                }`}>
                  {thread.title}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
                  <span>{thread.messageCount} messages</span>
                  <span>{formatDate(thread.updatedAt)}</span>
                </div>
              </button>
            )
          })
        )}
      </nav>
    </aside>
  )
}
