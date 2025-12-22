import { useState, useCallback } from 'react'

const MASTRA_PORT = 6700

export interface GenerateSummaryResult {
  success: boolean
  weekFolder?: string
  summaryPath?: string
  artifactCount?: number
  error?: string
}

export interface UseGenerateSummaryOptions {
  onSuccess?: (weekId: string, result: GenerateSummaryResult) => void
  onError?: (weekId: string, error: string) => void
}

export interface UseGenerateSummaryReturn {
  /** Set of weekIds currently being generated */
  generatingWeeks: Set<string>
  /** Check if a specific week is currently generating */
  isGenerating: (weekId: string) => boolean
  /** Generate summary for a week */
  generateSummary: (weekId: string) => Promise<GenerateSummaryResult>
}

/**
 * Hook for generating week summaries via the Mastra workflow API.
 *
 * @example
 * ```tsx
 * const { generateSummary, isGenerating } = useGenerateSummary({
 *   onSuccess: (weekId) => refreshWeeks(),
 *   onError: (weekId, error) => console.error(error)
 * })
 *
 * <button
 *   onClick={() => generateSummary('week-2024-Week_47_Nov17-Nov23')}
 *   disabled={isGenerating('week-2024-Week_47_Nov17-Nov23')}
 * >
 *   Generate Summary
 * </button>
 * ```
 */
export function useGenerateSummary(
  options: UseGenerateSummaryOptions = {}
): UseGenerateSummaryReturn {
  const { onSuccess, onError } = options
  const [generatingWeeks, setGeneratingWeeks] = useState<Set<string>>(new Set())

  const isGenerating = useCallback(
    (weekId: string) => generatingWeeks.has(weekId),
    [generatingWeeks]
  )

  const generateSummary = useCallback(
    async (weekId: string): Promise<GenerateSummaryResult> => {
      // Parse weekId to extract the path
      // Format: week-{year}-{weekFolder} -> {year}/{weekFolder}
      const match = weekId.match(/^week-(\d{4})-(.+)$/)
      if (!match) {
        const error = `Invalid week ID format: ${weekId}`
        onError?.(weekId, error)
        return { success: false, error }
      }

      const [, year, weekFolder] = match
      const weekPath = `${year}/${weekFolder}`

      // Mark as generating
      setGeneratingWeeks(prev => new Set(prev).add(weekId))

      try {
        // Call Mastra workflow API
        const response = await fetch(
          `http://localhost:${MASTRA_PORT}/api/workflows/weekSummaryWorkflow/start-async`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputData: { weekPath },
            }),
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()

        // The async workflow returns immediately with a run ID
        // We need to poll for completion or wait a reasonable time
        // For now, we'll wait for the workflow to complete by polling
        const runId = data.runId

        if (runId) {
          // Poll for completion
          const result = await pollWorkflowCompletion(runId)

          if (result.success) {
            const successResult: GenerateSummaryResult = {
              success: true,
              weekFolder: result.output?.week_folder,
              summaryPath: result.output?.summary_path,
              artifactCount: result.output?.artifact_count,
            }
            onSuccess?.(weekId, successResult)
            return successResult
          } else {
            throw new Error(result.error || 'Workflow failed')
          }
        }

        // If no runId, the workflow completed synchronously
        const successResult: GenerateSummaryResult = {
          success: true,
          weekFolder: data.output?.week_folder,
          summaryPath: data.output?.summary_path,
          artifactCount: data.output?.artifact_count,
        }
        onSuccess?.(weekId, successResult)
        return successResult

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        onError?.(weekId, errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        // Remove from generating set
        setGeneratingWeeks(prev => {
          const next = new Set(prev)
          next.delete(weekId)
          return next
        })
      }
    },
    [onSuccess, onError]
  )

  return {
    generatingWeeks,
    isGenerating,
    generateSummary,
  }
}

/**
 * Poll the Mastra workflow for completion
 */
async function pollWorkflowCompletion(
  runId: string,
  maxAttempts = 60,
  intervalMs = 2000
): Promise<{ success: boolean; output?: Record<string, unknown>; error?: string }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `http://localhost:${MASTRA_PORT}/api/workflows/weekSummaryWorkflow/runs/${runId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        // Run might not be found yet, continue polling
        await sleep(intervalMs)
        continue
      }

      const data = await response.json()

      // Check status
      if (data.status === 'completed' || data.status === 'success') {
        return { success: true, output: data.output || data.result }
      } else if (data.status === 'failed' || data.status === 'error') {
        return { success: false, error: data.error || 'Workflow failed' }
      }

      // Still running, continue polling
      await sleep(intervalMs)
    } catch (err) {
      // Network error, continue polling
      await sleep(intervalMs)
    }
  }

  return { success: false, error: 'Workflow timed out' }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
