import { Check } from 'lucide-react'
import type { SetupStep } from './types'

interface StepIndicatorProps {
  steps: SetupStep[]
  currentStep: number
  onGoToStep?: (stepNumber: number) => void
}

export function StepIndicator({ steps, currentStep, onGoToStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Step indicators */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isComplete = step.isComplete
          const isActive = step.stepNumber === currentStep
          const isClickable = step.isComplete || step.stepNumber <= currentStep

          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <button
                onClick={() => isClickable && onGoToStep?.(step.stepNumber)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full
                  transition-all duration-300 ease-out
                  ${isComplete
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                  }
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                `}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {isComplete ? (
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <span className="text-sm font-semibold">{step.stepNumber}</span>
                )}
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="relative w-6 sm:w-24 md:w-32 h-0.5 mx-1 sm:mx-2">
                  {/* Background line */}
                  <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                  {/* Progress line */}
                  <div
                    className={`
                      absolute inset-y-0 left-0 bg-emerald-500 rounded-full
                      transition-all duration-500 ease-out
                    `}
                    style={{
                      width: step.isComplete ? '100%' : '0%'
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Step labels - hidden on mobile */}
      <div className="hidden sm:flex items-start justify-center mt-3">
        {steps.map((step, index) => {
          const isActive = step.stepNumber === currentStep
          const isComplete = step.isComplete

          return (
            <div key={`label-${step.id}`} className="flex items-center">
              <div className="w-10 text-center">
                <span
                  className={`
                    text-xs font-medium transition-colors
                    ${isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isComplete
                        ? 'text-zinc-600 dark:text-zinc-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }
                  `}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-16 sm:w-24 md:w-32 mx-2" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
