import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WeekList, type Week } from '../components/contextualize'

export function ContextualizePage() {
  const navigate = useNavigate()
  const [weeks, setWeeks] = useState<Week[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadWeeks() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await window.electronAPI.getWeeks()
        if (result.success) {
          setWeeks(result.weeks || [])
        } else {
          setError(result.error || 'Failed to load weeks')
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    loadWeeks()
  }, [])

  const handleViewWeek = (weekId: string) => {
    // Navigate to browse view with the selected week
    navigate(`/browse?weekId=${encodeURIComponent(weekId)}`)
  }

  const handleGenerateSummary = (weekId: string) => {
    console.log('Generate summary for:', weekId)
    // TODO: Call Mastra API to generate summary
  }

  const handleStartChat = (weekId: string) => {
    console.log('Start chat for:', weekId)
    // TODO: Navigate to chat view
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            Loading weeks...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-200" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Failed to load weeks
            </h3>
            <p className="text-sm text-zinc-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <WeekList
      weeks={weeks}
      onViewWeek={handleViewWeek}
      onGenerateSummary={handleGenerateSummary}
      onStartChat={handleStartChat}
    />
  )
}
