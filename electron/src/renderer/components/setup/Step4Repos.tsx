import { GitBranch, Plus, Check, X, Clock } from 'lucide-react'
import type { Repository } from './types'

interface Step4ReposProps {
  repositories: Repository[]
  onConnectRepo?: (repoId: string) => void
  onDisconnectRepo?: (repoId: string) => void
  onBrowseRepo?: () => void
}

export function Step4Repos({
  repositories,
  onConnectRepo,
  onDisconnectRepo,
  onBrowseRepo
}: Step4ReposProps) {
  const connectedRepos = repositories.filter(r => r.isConnected)
  const availableRepos = repositories.filter(r => !r.isConnected)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
          <GitBranch className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2
          className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Connect Git Repositories
        </h2>
        <p
          className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Select repositories to track. Commits will be automatically captured and summarized.
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Connected repos */}
        {connectedRepos.length > 0 && (
          <div className="space-y-3">
            <h3
              className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Connected ({connectedRepos.length})
            </h3>
            <div className="space-y-2">
              {connectedRepos.map(repo => (
                <div
                  key={repo.id}
                  className="flex items-center gap-4 p-4 rounded-xl
                    bg-emerald-50 dark:bg-emerald-950/30
                    border border-emerald-200 dark:border-emerald-800"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg
                    bg-emerald-100 dark:bg-emerald-900">
                    <GitBranch className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-emerald-800 dark:text-emerald-200"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {repo.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span
                        className="text-xs text-emerald-600 dark:text-emerald-400 truncate"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {repo.path}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-3 h-3" />
                        <span style={{ fontFamily: 'Inter, sans-serif' }}>
                          {formatDate(repo.lastCommitDate)}
                        </span>
                      </div>
                      <p
                        className="text-xs text-emerald-500 dark:text-emerald-500 mt-0.5"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {repo.commitCount} commits
                      </p>
                    </div>
                    <button
                      onClick={() => onDisconnectRepo?.(repo.id)}
                      className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400
                        hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                      title="Disconnect repository"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available repos */}
        {availableRepos.length > 0 && (
          <div className="space-y-3">
            <h3
              className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Available ({availableRepos.length})
            </h3>
            <div className="space-y-2">
              {availableRepos.map(repo => (
                <div
                  key={repo.id}
                  className="flex items-center gap-4 p-4 rounded-xl
                    bg-white dark:bg-zinc-800
                    border border-zinc-200 dark:border-zinc-700
                    hover:border-emerald-300 dark:hover:border-emerald-700
                    transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg
                    bg-zinc-100 dark:bg-zinc-700">
                    <GitBranch className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-zinc-900 dark:text-zinc-100"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {repo.name}
                    </p>
                    <span
                      className="text-xs text-zinc-500 dark:text-zinc-400 truncate block"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {repo.path}
                    </span>
                  </div>
                  <button
                    onClick={() => onConnectRepo?.(repo.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium
                      transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <Check className="w-4 h-4" />
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new repo button */}
        <button
          onClick={onBrowseRepo}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl
            border-2 border-dashed border-zinc-300 dark:border-zinc-600
            text-zinc-600 dark:text-zinc-400 font-medium
            hover:border-emerald-400 dark:hover:border-emerald-500
            hover:text-emerald-600 dark:hover:text-emerald-400
            hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20
            transition-all"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <Plus className="w-5 h-5" />
          Browse for Another Repository
        </button>
      </div>

      {/* Info note */}
      <div className="max-w-xl mx-auto p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <p
          className="text-sm text-amber-800 dark:text-amber-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <strong>How it works:</strong> We add a post-commit hook to each repository.
          Every time you commit, the changes are summarized and added to your artifacts.
        </p>
      </div>
    </div>
  )
}
