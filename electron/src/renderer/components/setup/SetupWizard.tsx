import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import type { SetupProps } from './types'
import { StepIndicator } from './StepIndicator'
import { Step1Folder } from './Step1Folder'
import { Step2ApiKey } from './Step2ApiKey'
import { Step3Automation } from './Step3Automation'
import { Step4Repos } from './Step4Repos'

export function SetupWizard({
  config,
  steps,
  repositories,
  workflows,
  onSelectFolder,
  onSaveApiKey,
  onInstallAutomation,
  onUninstallAutomation,
  onConnectRepo,
  onDisconnectRepo,
  onBrowseRepo,
  onGoToStep,
  onNextStep,
  onPrevStep,
  onComplete
}: SetupProps) {
  const currentStep = config.currentStep
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === steps.length
  const screenshotWorkflow = workflows.find(w => w.type === 'screenshot')

  // Check if current step is complete enough to proceed
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return config.artifactsFolderSet
      case 2:
        return config.apiKeySet
      case 3:
        return true // Automation is optional
      case 4:
        return true // At least allow completion
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Folder
            artifactsFolder={config.artifactsFolder}
            artifactsFolderSet={config.artifactsFolderSet}
            onSelectFolder={onSelectFolder}
          />
        )
      case 2:
        return (
          <Step2ApiKey
            apiKey={config.apiKey}
            apiKeySet={config.apiKeySet}
            onSaveApiKey={onSaveApiKey}
          />
        )
      case 3:
        return (
          <Step3Automation
            workflow={screenshotWorkflow}
            platform={config.automationPlatform}
            onInstallAutomation={onInstallAutomation}
            onUninstallAutomation={onUninstallAutomation}
          />
        )
      case 4:
        return (
          <Step4Repos
            repositories={repositories}
            onConnectRepo={onConnectRepo}
            onDisconnectRepo={onDisconnectRepo}
            onBrowseRepo={onBrowseRepo}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      {/* Draggable top bar for window controls */}
      <div
        className="h-8 flex-shrink-0 absolute top-0 left-0 right-0 z-20"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />
      {/* Header */}
      <header className="flex-shrink-0 backdrop-blur-lg bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 pt-8">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25">
                AE
              </div>
              <div>
                <h1
                  className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Artifact Engine
                </h1>
                <p
                  className="text-xs text-zinc-500 dark:text-zinc-400"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Setup Wizard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span
                className="text-sm text-zinc-600 dark:text-zinc-400"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Step {currentStep} of {steps.length}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            onGoToStep={onGoToStep}
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {renderStepContent()}
        </div>
      </main>

      {/* Footer navigation */}
      <footer className="flex-shrink-0 backdrop-blur-lg bg-white/80 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={onPrevStep}
              disabled={isFirstStep}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                ${isFirstStep
                  ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }
              `}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Next/Complete button */}
            {isLastStep ? (
              <button
                onClick={onComplete}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold
                  bg-emerald-500 hover:bg-emerald-600 text-white
                  shadow-lg shadow-emerald-500/25 transition-all"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Complete Setup
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onNextStep}
                disabled={!canProceed()}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all
                  ${canProceed()
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                  }
                `}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
