import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Folder,
  Key,
  Eye,
  EyeOff,
  Camera,
  GitBranch,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Trash2
} from 'lucide-react'

interface GitRepository {
  name: string
  path: string
  hasHook: boolean
}

export function SettingsPage() {
  const navigate = useNavigate()

  // State
  const [artifactsFolder, setArtifactsFolder] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [automationInstalled, setAutomationInstalled] = useState(false)
  const [repos, setRepos] = useState<GitRepository[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isScanningRepos, setIsScanningRepos] = useState(false)
  const [savingApiKey, setSavingApiKey] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [showContextMessages, setShowContextMessages] = useState(() => {
    return localStorage.getItem('dev_showContextMessages') === 'true'
  })

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true)
      try {
        const config = await window.electronAPI.getConfig()
        setArtifactsFolder(config.artifactsFolder || '')
        setApiKey(config.apiKey || '')
        setApiKeyInput(config.apiKey || '')

        if (window.electronAPI.platform === 'darwin') {
          const folderActionStatus = await window.electronAPI.getFolderActionStatus()
          setAutomationInstalled(folderActionStatus.installed)
        }

        // Load repos
        const repoList = await window.electronAPI.scanGitRepos()
        setRepos(repoList)
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Handlers
  const handleSelectFolder = async () => {
    const result = await window.electronAPI.selectFolder()
    if (result.success && result.path) {
      setArtifactsFolder(result.path)
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return
    setSavingApiKey(true)
    try {
      const result = await window.electronAPI.saveApiKey(apiKeyInput.trim())
      if (result.success) {
        setApiKey(apiKeyInput.trim())
        // Restart Mastra server to pick up the new API key
        await window.electronAPI.restartMastraServer()
      }
    } finally {
      setSavingApiKey(false)
    }
  }

  const handleInstallAutomation = async () => {
    const result = await window.electronAPI.setupFolderAction()
    if (result.success) {
      setAutomationInstalled(true)
    }
  }

  const handleUninstallAutomation = async () => {
    const result = await window.electronAPI.removeFolderAction()
    if (result.success) {
      setAutomationInstalled(false)
    }
  }

  const handleScanRepos = async () => {
    setIsScanningRepos(true)
    try {
      const repoList = await window.electronAPI.scanGitRepos()
      setRepos(repoList)
    } finally {
      setIsScanningRepos(false)
    }
  }

  const handleToggleHook = async (repo: GitRepository) => {
    if (repo.hasHook) {
      const result = await window.electronAPI.removeGitHook(repo.path)
      if (result.success) {
        setRepos(repos.map(r =>
          r.path === repo.path ? { ...r, hasHook: false } : r
        ))
      }
    } else {
      const result = await window.electronAPI.installGitHook(repo.path)
      if (result.success) {
        setRepos(repos.map(r =>
          r.path === repo.path ? { ...r, hasHook: true } : r
        ))
      }
    }
  }

  const handleToggleContextMessages = () => {
    const newValue = !showContextMessages
    setShowContextMessages(newValue)
    localStorage.setItem('dev_showContextMessages', String(newValue))
  }

  const handleResetConfig = async () => {
    if (!confirm('Are you sure you want to reset all settings? This will delete your configuration and redirect you to setup.')) {
      return
    }
    setIsResetting(true)
    try {
      // Stop desktop automation if running
      if (automationInstalled) {
        await window.electronAPI.removeFolderAction()
      }
      // Stop Mastra server
      await window.electronAPI.stopMastraServer()
      // Reset configuration
      const result = await window.electronAPI.resetConfig()
      if (result.success) {
        navigate('/setup')
      }
    } finally {
      setIsResetting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading settings...</p>
        </div>
      </div>
    )
  }

  const enabledReposCount = repos.filter(r => r.hasHook).length

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 drag-region">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Settings
          </h1>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
            Configure Artifact Engine to match your workflow
          </p>
        </div>
      </header>

      {/* Settings Sections */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Artifacts Folder */}
        <section className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900">
                <Folder className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Artifacts Folder
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Where your captured work is stored
                </p>
              </div>
              <div className="ml-auto">
                {artifactsFolder ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
                    <Check className="w-3.5 h-3.5" />
                    Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Not Set
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-6">
            {artifactsFolder ? (
              <div className="flex items-center gap-4">
                <div className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 font-mono truncate">
                    {artifactsFolder}
                  </p>
                </div>
                <button
                  onClick={handleSelectFolder}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={handleSelectFolder}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all"
              >
                Select Folder
              </button>
            )}
          </div>
        </section>

        {/* API Key */}
        <section className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900">
                <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  OpenAI API Key
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Powers AI analysis and summarization
                </p>
              </div>
              <div className="ml-auto">
                {apiKey ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
                    <Check className="w-3.5 h-3.5" />
                    Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Not Set
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput.trim() || apiKeyInput === apiKey || savingApiKey}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white disabled:text-zinc-500 font-medium transition-all"
              >
                {savingApiKey ? 'Saving...' : apiKey ? 'Update' : 'Save'}
              </button>
            </div>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              Get an API key from OpenAI
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Screenshot Automation (macOS only) */}
        {window.electronAPI.platform === 'darwin' && (
          <section className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900">
                  <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Screenshot Automation
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Auto-process screenshots saved to Desktop
                  </p>
                </div>
                <div className="ml-auto">
                  {automationInstalled ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
                      <Check className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-medium rounded-full">
                      <X className="w-3.5 h-3.5" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6">
              {automationInstalled ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Screenshots saved to your Desktop will be automatically processed
                  </p>
                  <button
                    onClick={handleUninstallAutomation}
                    className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  >
                    Disable
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleInstallAutomation}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Enable Automation
                </button>
              )}
            </div>
          </section>
        )}

        {/* Git Repositories */}
        <section className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900">
                <GitBranch className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Git Repositories
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Auto-capture commits with post-commit hooks
                </p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {enabledReposCount} of {repos.length} enabled
                </span>
                <button
                  onClick={handleScanRepos}
                  disabled={isScanningRepos}
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  title="Rescan repositories"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanningRepos ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {repos.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No Git repositories found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {repos.map((repo) => (
                  <div
                    key={repo.path}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {repo.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-mono">
                        {repo.path}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleHook(repo)}
                      className={`
                        relative w-11 h-6 rounded-full transition-colors
                        ${repo.hasHook
                          ? 'bg-emerald-500'
                          : 'bg-zinc-300 dark:bg-zinc-600'
                        }
                      `}
                    >
                      <span
                        className={`
                          absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                          ${repo.hasHook ? 'translate-x-5' : 'translate-x-0'}
                        `}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 overflow-hidden">
          <div className="p-6 border-b border-red-200 dark:border-red-900/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
                  Danger Zone
                </h2>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Development tools - use with caution
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Show Context Messages Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-900 dark:text-red-100">
                  Show Context Messages
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Display week context messages copied from main thread in chat
                </p>
              </div>
              <button
                onClick={handleToggleContextMessages}
                className={`
                  relative w-11 h-6 rounded-full transition-colors
                  ${showContextMessages
                    ? 'bg-emerald-500'
                    : 'bg-zinc-300 dark:bg-zinc-600'
                  }
                `}
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                    ${showContextMessages ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            {/* Reset Settings */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-red-900 dark:text-red-100">
                  Reset All Settings
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Delete configuration and return to setup wizard
                </p>
              </div>
              <button
                onClick={handleResetConfig}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium transition-colors"
              >
                {isResetting ? 'Resetting...' : 'Reset Settings'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
