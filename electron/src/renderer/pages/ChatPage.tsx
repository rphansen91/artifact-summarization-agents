import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChatView } from '../product-plan/sections/contextualize/components'
import type { Week } from '../components/contextualize/types'
import { useMastraChat } from '../hooks'

export function ChatPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const weekId = searchParams.get('weekId')

  // Query: Load week data
  const {
    data: week,
    isLoading,
    error: weekError,
  } = useQuery({
    queryKey: ['week', weekId],
    queryFn: async () => {
      if (!weekId) throw new Error('No week specified')
      const result = await window.electronAPI.getWeeks()
      if (!result.success) throw new Error(result.error || 'Failed to load weeks')
      const foundWeek = result.weeks?.find((w: Week) => w.id === weekId)
      if (!foundWeek) throw new Error('Week not found')
      return foundWeek as Week
    },
    enabled: !!weekId,
  })

  const error = weekError instanceof Error ? weekError.message : weekError ? String(weekError) : null

  // Use Mastra chat hook
  const {
    threads,
    activeThread,
    isLoadingMessages,
    isStreaming,
    streamingContent,
    messages,
    threadsError,
    selectThread,
    createThread,
    sendMessage,
  } = useMastraChat({
    weekId: weekId || '',
    onError: (err) => console.error('Chat error:', err),
  })

  const handleBack = useCallback(() => {
    navigate('/contextualize')
  }, [navigate])

  const handleViewArtifact = useCallback((artifactId: string) => {
    navigate(`/browse?artifactId=${encodeURIComponent(artifactId)}`)
  }, [navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (error || !week) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-200">
              {error || 'Week not found'}
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Unable to load the chat for this week.
            </p>
          </div>
          <button
            onClick={handleBack}
            className="mt-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors"
          >
            Back to weeks
          </button>
        </div>
      </div>
    )
  }

  // Show server connection error
  if (threadsError && threadsError.includes('Mastra server is not running')) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-200">
              Server Not Running
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              The Mastra AI server needs to be running for chat to work.
            </p>
            <p className="text-xs text-zinc-600 mt-2 font-mono bg-zinc-800 px-3 py-2 rounded">
              cd .. && pnpm run dev
            </p>
          </div>
          <button
            onClick={handleBack}
            className="mt-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors"
          >
            Back to weeks
          </button>
        </div>
      </div>
    )
  }

  return (
    <ChatView
      week={week}
      threads={threads}
      activeThread={activeThread}
      messages={messages}
      onSelectThread={selectThread}
      onCreateThread={createThread}
      onSendMessage={sendMessage}
      onViewArtifact={handleViewArtifact}
      onBack={handleBack}
      isStreaming={isStreaming}
      streamingContent={streamingContent}
      isLoadingMessages={isLoadingMessages}
    />
  )
}
