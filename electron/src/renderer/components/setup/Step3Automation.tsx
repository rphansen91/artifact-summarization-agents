import { Camera, Download, Check, Command, Sparkles } from 'lucide-react'
import type { Workflow, Platform } from './types'

interface Step3AutomationProps {
  workflow: Workflow | undefined
  platform: Platform
  onInstallAutomation?: () => void
  onUninstallAutomation?: () => void
}

export function Step3Automation({
  workflow,
  platform,
  onInstallAutomation,
  onUninstallAutomation
}: Step3AutomationProps) {
  const isInstalled = workflow?.isInstalled ?? false

  const platformName = platform === 'mac' ? 'macOS' : platform === 'windows' ? 'Windows' : 'Linux'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50">
          <Camera className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2
          className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Screenshot Automation
        </h2>
        <p
          className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Capture your screen with a keyboard shortcut. AI will analyze and file it automatically.
        </p>
      </div>

      {/* Installation card */}
      <div className="max-w-lg mx-auto">
        <div
          className={`
            p-6 rounded-2xl border-2 transition-all
            ${isInstalled
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
            }
          `}
        >
          {isInstalled ? (
            <div className="space-y-6">
              {/* Installed state */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900">
                  <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3
                    className="font-semibold text-emerald-800 dark:text-emerald-200"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Automation Installed
                  </h3>
                  <p
                    className="text-sm text-emerald-600 dark:text-emerald-400 mt-1"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Ready to capture screenshots on {platformName}
                  </p>
                </div>
              </div>

              {/* Shortcut display */}
              <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-white/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-1">
                  <Command className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span
                    className="text-base font-semibold text-emerald-700 dark:text-emerald-300"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    + Shift + 4
                  </span>
                </div>
                <span className="text-sm text-emerald-600 dark:text-emerald-400">or</span>
                <div className="flex items-center gap-1">
                  <Command className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span
                    className="text-base font-semibold text-emerald-700 dark:text-emerald-300"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    + Shift + 3
                  </span>
                </div>
              </div>

              {/* Uninstall option */}
              <button
                onClick={onUninstallAutomation}
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 dark:border-emerald-700
                  text-emerald-700 dark:text-emerald-300 font-medium
                  hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Uninstall Automation
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Not installed state */}
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-700">
                  <Download className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div>
                  <h3
                    className="font-semibold text-zinc-900 dark:text-zinc-100"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {platformName} Automation
                  </h3>
                  <p
                    className="text-sm text-zinc-600 dark:text-zinc-400 mt-1"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    One-click install for {platformName === 'macOS' ? 'Folder Action' : 'Task Scheduler'}
                  </p>
                </div>
              </div>

              {/* Features list */}
              <div className="space-y-3">
                {[
                  'Capture screen with keyboard shortcut',
                  'AI analyzes and summarizes content',
                  'Automatically filed to the right category'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span
                      className="text-sm text-zinc-600 dark:text-zinc-400"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Install button */}
              <button
                onClick={onInstallAutomation}
                className="w-full py-3 px-4 rounded-xl font-semibold
                  bg-emerald-500 hover:bg-emerald-600 text-white
                  shadow-lg shadow-emerald-500/25 transition-all"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Install Automation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Skip note */}
      <div className="text-center">
        <p
          className="text-sm text-zinc-500 dark:text-zinc-400"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          You can skip this step and install the automation later from settings.
        </p>
      </div>
    </div>
  )
}
