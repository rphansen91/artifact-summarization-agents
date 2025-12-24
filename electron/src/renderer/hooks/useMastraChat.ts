import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mastraClient } from '../services/mastraClient'
import type { ChatThread, ChatMessage as ChatMessageType } from '../components/contextualize/types'

const AGENT_ID = 'artifactAgent'

interface MastraMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string | { type: string; text?: string }[]
  createdAt?: string
}

interface MastraThread {
  id: string
  title?: string
  resourceId?: string
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, unknown>
}

export interface UseMastraChatOptions {
  weekId: string
  resourceId?: string
  onError?: (error: string) => void
}

export interface UseMastraChatReturn {
  // Thread management
  threads: ChatThread[]
  activeThread: ChatThread | null
  isLoadingThreads: boolean
  threadsError: string | null
  loadThreads: () => void
  selectThread: (threadId: string) => void
  createThread: () => Promise<string | null>

  // Message management
  messages: ChatMessageType[]
  isLoadingMessages: boolean
  isStreaming: boolean
  streamingContent: string
  sendMessage: (content: string) => Promise<void>
}

// Helper to extract text content from message
function getMessageContent(content: string | { type: string; text?: string }[]): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .filter(part => part.type === 'text' && part.text)
      .map(part => part.text)
      .join('')
  }
  return ''
}

// Helper to format connection errors
function formatError(err: unknown): string {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error'
  if (errorMessage.includes('ERR_CONNECTION_REFUSED') || errorMessage.includes('fetch failed')) {
    return 'Mastra server is not running. Start it with: cd .. && pnpm run dev'
  }
  return errorMessage
}

// API functions
async function fetchThreads(resourceId: string): Promise<ChatThread[]> {
  const response = await mastraClient.getMemoryThreads({
    resourceId,
    agentId: AGENT_ID,
  })

  const threadList = response?.threads || response || []
  return (Array.isArray(threadList) ? threadList : []).map((thread: MastraThread) => ({
    id: thread.id,
    weekId: resourceId,
    title: thread.title || 'New conversation',
    createdAt: thread.createdAt || new Date().toISOString(),
    updatedAt: thread.updatedAt || new Date().toISOString(),
    messageCount: (thread.metadata?.messageCount as number) || 0,
  }))
}

async function fetchMessages(threadId: string): Promise<ChatMessageType[]> {
  const response = await mastraClient.getThreadMessages(threadId, {
    agentId: AGENT_ID,
  })

  const messageList = response?.messages || response || []
  return (Array.isArray(messageList) ? messageList : [])
    .filter((msg: MastraMessage) => msg.role === 'user' || msg.role === 'assistant')
    .map((msg: MastraMessage) => ({
      id: msg.id,
      threadId,
      role: msg.role as 'user' | 'assistant',
      content: getMessageContent(msg.content),
      timestamp: msg.createdAt || new Date().toISOString(),
      referencedArtifacts: [],
    }))
}

async function createMemoryThread(resourceId: string, weekId: string): Promise<MastraThread> {
  const response = await mastraClient.createMemoryThread({
    resourceId,
    agentId: AGENT_ID,
    title: `Chat about ${weekId}`,
    metadata: {
      weekId,
      createdAt: new Date().toISOString(),
    },
  })
  return response?.thread || response
}

/**
 * Hook for managing chat with Mastra agents using TanStack Query.
 * Handles thread management, message loading, and streaming responses.
 */
export function useMastraChat(options: UseMastraChatOptions): UseMastraChatReturn {
  const { weekId, resourceId, onError } = options
  const effectiveResourceId = resourceId || weekId
  const queryClient = useQueryClient()

  // Active thread state (local)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  // Optimistic messages (for showing user message before server confirms)
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessageType[]>([])

  // Abort controller for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null)

  // Query: Fetch threads
  const {
    data: threads = [],
    isLoading: isLoadingThreads,
    error: threadsQueryError,
    refetch: refetchThreads,
  } = useQuery({
    queryKey: ['threads', effectiveResourceId],
    queryFn: () => fetchThreads(effectiveResourceId),
    enabled: !!effectiveResourceId,
  })

  // Format thread error
  const threadsError = threadsQueryError ? formatError(threadsQueryError) : null

  // Report errors to parent
  useEffect(() => {
    if (threadsError) {
      onError?.(threadsError)
    }
  }, [threadsError, onError])

  // Query: Fetch messages for active thread
  const {
    data: serverMessages = [],
    isLoading: isLoadingMessages,
  } = useQuery({
    queryKey: ['messages', activeThreadId],
    queryFn: () => fetchMessages(activeThreadId!),
    enabled: !!activeThreadId,
  })

  // Combine server messages with optimistic messages
  const messages = [...serverMessages, ...optimisticMessages]

  // Get active thread object
  const activeThread = threads.find(t => t.id === activeThreadId) || null

  // Mutation: Create thread
  const createThreadMutation = useMutation({
    mutationFn: () => createMemoryThread(effectiveResourceId, weekId),
    onSuccess: (thread) => {
      // Add new thread to cache
      queryClient.setQueryData<ChatThread[]>(
        ['threads', effectiveResourceId],
        (old = []) => [{
          id: thread.id,
          weekId,
          title: thread.title || 'New conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0,
        }, ...old]
      )
      // Select the new thread
      setActiveThreadId(thread.id)
      setOptimisticMessages([])
    },
    onError: (err) => {
      onError?.(formatError(err))
    },
  })

  // Select a thread
  const selectThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId)
    setOptimisticMessages([])
  }, [])

  // Create a new thread
  const createThread = useCallback(async (): Promise<string | null> => {
    try {
      const result = await createThreadMutation.mutateAsync()
      return result.id
    } catch {
      return null
    }
  }, [createThreadMutation])

  // Send a message with streaming response
  const sendMessage = useCallback(async (content: string) => {
    if (!activeThreadId || isStreaming) return

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    // Add user message optimistically
    const userMessage: ChatMessageType = {
      id: `temp-user-${Date.now()}`,
      threadId: activeThreadId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      referencedArtifacts: [],
    }
    setOptimisticMessages(prev => [...prev, userMessage])

    // Start streaming
    setIsStreaming(true)
    setStreamingContent('')

    try {
      const agent = mastraClient.getAgent(AGENT_ID)
      const response = await agent.stream({
        threadId: activeThreadId,
        resourceId: effectiveResourceId,
        messages: [{ role: 'user' as const, content }],
      })

      let fullContent = ''

      // Process the stream using the SDK's processDataStream
      await response.processDataStream({
        onChunk: (chunk: { type?: string; textDelta?: string; payload?: { text?: string } }) => {
          if (abortControllerRef.current?.signal.aborted) return

          // Handle text chunks - Mastra wraps text in payload.text
          if (chunk.type === 'text-delta') {
            const text = chunk.textDelta || chunk.payload?.text
            if (text) {
              fullContent += text
              setStreamingContent(fullContent)
            }
          }
        },
      })

      // Add assistant message to optimistic messages
      const assistantMessage: ChatMessageType = {
        id: `temp-assistant-${Date.now()}`,
        threadId: activeThreadId,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
        referencedArtifacts: [],
      }
      setOptimisticMessages(prev => [...prev, assistantMessage])

      // Update thread in cache to reflect new message count
      queryClient.setQueryData<ChatThread[]>(
        ['threads', effectiveResourceId],
        (old = []) => old.map(t =>
          t.id === activeThreadId
            ? { ...t, messageCount: t.messageCount + 2, updatedAt: new Date().toISOString() }
            : t
        )
      )

      // Invalidate messages query to sync with server (but don't refetch immediately)
      queryClient.invalidateQueries({
        queryKey: ['messages', activeThreadId],
        refetchType: 'none',
      })

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      const errorMessage = formatError(err)
      onError?.(errorMessage)

      // Add error message
      const errorResponse: ChatMessageType = {
        id: `temp-error-${Date.now()}`,
        threadId: activeThreadId,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date().toISOString(),
        referencedArtifacts: [],
      }
      setOptimisticMessages(prev => [...prev, errorResponse])
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
      abortControllerRef.current = null
    }
  }, [activeThreadId, isStreaming, effectiveResourceId, onError, queryClient])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Clear optimistic messages when server messages update
  useEffect(() => {
    if (serverMessages.length > 0) {
      // Check if server has caught up with our optimistic messages
      const lastServerMsg = serverMessages[serverMessages.length - 1]
      const hasOptimistic = optimisticMessages.some(m =>
        !serverMessages.find(sm => sm.content === m.content && sm.role === m.role)
      )
      if (!hasOptimistic && optimisticMessages.length > 0) {
        setOptimisticMessages([])
      }
    }
  }, [serverMessages, optimisticMessages])

  return {
    threads,
    activeThread,
    isLoadingThreads,
    threadsError,
    loadThreads: refetchThreads,
    selectThread,
    createThread,
    messages,
    isLoadingMessages,
    isStreaming,
    streamingContent,
    sendMessage,
  }
}
