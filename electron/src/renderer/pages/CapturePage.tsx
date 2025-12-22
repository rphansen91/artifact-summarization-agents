import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  GitBranch,
  Check,
  X,
  Command,
  Sparkles,
  ArrowRight,
  Info,
  Keyboard,
  FolderOpen,
  Zap,
  Settings,
  ChevronRight
} from 'lucide-react'

interface GitRepository {
  name: string
  path: string
  hasHook: boolean
}

export function CapturePage() {
  const navigate = useNavigate()

  const [automationInstalled, setAutomationInstalled] = useState(false)
  const [repos, setRepos] = useState<GitRepository[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInstallingAutomation, setIsInstallingAutomation] = useState(false)

  const isMac = window.electronAPI?.platform === 'darwin'

  useEffect(() => {
    async function loadStatus() {
      setIsLoading(true)
      try {
        if (isMac) {
          const folderActionStatus = await window.electronAPI.getFolderActionStatus()
          setAutomationInstalled(folderActionStatus.installed)
        }

        const repoList = await window.electronAPI.scanGitRepos()
        setRepos(repoList)
      } catch (err) {
        console.error('Failed to load status:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadStatus()
  }, [isMac])

  const handleInstallAutomation = async () => {
    setIsInstallingAutomation(true)
    try {
      const result = await window.electronAPI.setupFolderAction()
      if (result.success) {
        setAutomationInstalled(true)
      }
    } finally {
      setIsInstallingAutomation(false)
    }
  }

  const enabledReposCount = repos.filter(r => r.hasHook).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1
            className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Capture Demo
          </h1>
          <p
            className="mt-2 text-lg text-zinc-500 dark:text-zinc-400"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Learn how to capture screenshots and commits automatically
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Screenshot Capture Section */}
        {isMac && (
          <section className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900">
                  <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Screenshot Capture
                  </h2>
                  <p
                    className="text-sm text-zinc-500 dark:text-zinc-400"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Capture and auto-analyze your screen
                  </p>
                </div>
                <div className="ml-auto">
                  {automationInstalled ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
                      <Check className="w-3.5 h-3.5" />
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                      <X className="w-3.5 h-3.5" />
                      Not Enabled
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {!automationInstalled ? (
                <>
                  {/* Not installed state */}
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p
                          className="text-sm font-medium text-amber-800 dark:text-amber-200"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          Screenshot automation is not enabled
                        </p>
                        <p
                          className="text-sm text-amber-700 dark:text-amber-300 mt-1"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          Enable it to automatically capture and analyze screenshots saved to your Desktop.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleInstallAutomation}
                    disabled={isInstallingAutomation}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {isInstallingAutomation ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Enable Screenshot Capture
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Installed state - show instructions */}
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span
                        className="text-sm font-semibold text-emerald-800 dark:text-emerald-200"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        Ready to capture!
                      </span>
                    </div>
                    <p
                      className="text-sm text-emerald-700 dark:text-emerald-300"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Screenshots saved to your Desktop will be automatically processed by AI.
                    </p>
                  </div>

                  {/* How to capture */}
                  <div>
                    <h3
                      className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      How to Capture a Screenshot
                    </h3>

                    <div className="space-y-3">
                      {/* Step 1 */}
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex-shrink-0">
                          1
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Keyboard className="w-4 h-4 text-zinc-500" />
                            <span
                              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              Press the keyboard shortcut
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700">
                              <Command className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                              <span
                                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                              >
                                + Shift + 4
                              </span>
                            </div>
                            <span className="text-sm text-zinc-500">or</span>
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700">
                              <Command className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                              <span
                                className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                              >
                                + Shift + 3
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex-shrink-0">
                          2
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FolderOpen className="w-4 h-4 text-zinc-500" />
                            <span
                              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              Screenshot saves to Desktop
                            </span>
                          </div>
                          <p
                            className="text-sm text-zinc-500 dark:text-zinc-400"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            Make sure your default screenshot location is set to Desktop
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex-shrink-0">
                          3
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span
                              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              AI analyzes and files it
                            </span>
                          </div>
                          <p
                            className="text-sm text-zinc-500 dark:text-zinc-400"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            The screenshot is analyzed, summarized, and moved to your artifacts folder
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* What happens next */}
                  <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <h4
                      className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      After capture, your screenshot will:
                    </h4>
                    <ul className="space-y-2">
                      {[
                        'Be analyzed by AI to extract key information',
                        'Get a descriptive filename based on content',
                        'Be categorized and filed automatically',
                        'Appear in your Browse section for review'
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <ArrowRight className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span style={{ fontFamily: 'Inter, sans-serif' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Git Commit Section */}
        <section className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900">
                <GitBranch className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Git Commit Capture
                </h2>
                <p
                  className="text-sm text-zinc-500 dark:text-zinc-400"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Auto-summarize your code commits
                </p>
              </div>
              <div className="ml-auto">
                {enabledReposCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
                    <Check className="w-3.5 h-3.5" />
                    {enabledReposCount} repo{enabledReposCount !== 1 ? 's' : ''} enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                    <X className="w-3.5 h-3.5" />
                    No repos enabled
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {enabledReposCount === 0 ? (
              <>
                {/* No repos enabled */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p
                        className="text-sm font-medium text-amber-800 dark:text-amber-200"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        No repositories are enabled for commit tracking
                      </p>
                      <p
                        className="text-sm text-amber-700 dark:text-amber-300 mt-1"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        Enable repositories in Settings to automatically capture and summarize your commits.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/settings')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  <Settings className="w-5 h-5" />
                  Enable Repositories in Settings
                </button>

                {repos.length > 0 && (
                  <p
                    className="text-sm text-zinc-500 dark:text-zinc-400 text-center"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {repos.length} repositor{repos.length !== 1 ? 'ies' : 'y'} found on your system
                  </p>
                )}
              </>
            ) : (
              <>
                {/* Repos enabled - show demo */}
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span
                      className="text-sm font-semibold text-emerald-800 dark:text-emerald-200"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Commit tracking active!
                    </span>
                  </div>
                  <p
                    className="text-sm text-emerald-700 dark:text-emerald-300"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Your commits in {enabledReposCount} repositor{enabledReposCount !== 1 ? 'ies' : 'y'} will be automatically captured.
                  </p>
                </div>

                {/* Enabled repos list */}
                <div>
                  <h3
                    className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Enabled Repositories
                  </h3>
                  <div className="space-y-2">
                    {repos.filter(r => r.hasHook).map((repo) => (
                      <div
                        key={repo.path}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                      >
                        <GitBranch className="w-4 h-4 text-emerald-500" />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {repo.name}
                          </p>
                          <p
                            className="text-xs text-zinc-500 dark:text-zinc-400 truncate"
                            style={{ fontFamily: 'JetBrains Mono, monospace' }}
                          >
                            {repo.path}
                          </p>
                        </div>
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* How it works */}
                <div>
                  <h3
                    className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    How Git Capture Works
                  </h3>

                  <div className="space-y-3">
                    {/* Step 1 */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex-shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <span
                          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          Make a commit as usual
                        </span>
                        <div className="mt-2 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-700">
                          <code
                            className="text-sm text-zinc-700 dark:text-zinc-300"
                            style={{ fontFamily: 'JetBrains Mono, monospace' }}
                          >
                            git commit -m "your message"
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex-shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            Post-commit hook triggers
                          </span>
                        </div>
                        <p
                          className="text-sm text-zinc-500 dark:text-zinc-400"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          AI analyzes your changes and creates a summary
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex-shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <span
                          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          Commit artifact saved
                        </span>
                        <p
                          className="text-sm text-zinc-500 dark:text-zinc-400 mt-1"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          Appears in Browse with diff, summary, and context
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Link to settings */}
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Settings className="w-4 h-4" />
                  Manage Repositories in Settings
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </section>

        {/* Quick tip */}
        <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
            <div>
              <p
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Tip: View your captured artifacts
              </p>
              <p
                className="text-sm text-zinc-600 dark:text-zinc-400 mt-1"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                After capturing screenshots or making commits, head to the{' '}
                <button
                  onClick={() => navigate('/browse')}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  Browse section
                </button>
                {' '}to see your artifacts organized and summarized.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
