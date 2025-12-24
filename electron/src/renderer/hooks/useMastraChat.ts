import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mastraClient } from '../services/mastraClient'
import type { ChatThread, ChatMessage as ChatMessageType } from '../components/contextualize/types'

const AGENT_ID = 'artifactAgent'
const MAIN_THREAD_ID = 'main'

interface MastraMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string | { type: string; text?: string }[]
  createdAt?: string
  threadId?: string
}

// Raw message type for copying (preserves all fields from server)
interface RawMastraMessage {
  id: string
  role: string
  content: unknown
  threadId?: string
  createdAt?: string
  [key: string]: unknown
}

interface MastraThread {
  id: string
  title?: string
  resourceId?: string
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, unknown>
}

interface ThreadMetadata {
  branchMessageCount?: number
  weekId?: string
  isWorkflowThread?: boolean
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
  deleteThread: (threadId: string) => Promise<boolean>

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
  return (Array.isArray(threadList) ? threadList : [])
    // Filter out the main thread - it's used for context only, not for display
    .filter((thread: MastraThread) => {
      const isMainThread = thread.id === MAIN_THREAD_ID ||
                           thread.id === 'main' ||
                           thread.metadata?.isWorkflowThread === true
      return !isMainThread
    })
    .map((thread: MastraThread) => ({
      id: thread.id,
      weekId: resourceId,
      title: thread.title || 'New conversation',
      createdAt: thread.createdAt || new Date().toISOString(),
      updatedAt: thread.updatedAt || new Date().toISOString(),
      messageCount: (thread.metadata?.messageCount as number) || 0,
      branchMessageCount: (thread.metadata?.branchMessageCount as number) || 0,
      lastContextMessageId: (thread.metadata?.lastContextMessageId as string) || null,
    }))
}

interface FetchMessagesOptions {
  lastContextMessageId?: string | null
  branchMessageCount?: number
}

async function fetchMessages(threadId: string, options: FetchMessagesOptions = {}): Promise<ChatMessageType[]> {
  const { lastContextMessageId = null, branchMessageCount = 0 } = options

  const response = await mastraClient.getThreadMessages(threadId, {
    agentId: AGENT_ID,
  })

  const messageList = response?.messages || response || []
  const filteredMessages = (Array.isArray(messageList) ? messageList : [])
    .filter((msg: MastraMessage) => msg.role === 'user' || msg.role === 'assistant')

  // Sort by timestamp ascending (oldest first) for consistent ordering
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime()
    const timeB = new Date(b.createdAt || 0).getTime()
    return timeA - timeB
  })

  // Find the index of the last context message (branch point)
  const branchPointIndex = lastContextMessageId
    ? sortedMessages.findIndex(msg => msg.id === lastContextMessageId)
    : -1

  return sortedMessages.map((msg: MastraMessage, index: number) => {
    // Check if this is a context message:
    // 1. Primary: at or before the branch point message (new format)
    // 2. Fallback: within first branchMessageCount messages (old format for backward compat)
    const isContext = (branchPointIndex >= 0 && index <= branchPointIndex) ||
                      (branchPointIndex < 0 && branchMessageCount > 0 && index < branchMessageCount)

    return {
      id: msg.id,
      threadId,
      role: msg.role as 'user' | 'assistant',
      content: getMessageContent(msg.content),
      timestamp: msg.createdAt || new Date().toISOString(),
      referencedArtifacts: [],
      isContextMessage: isContext,
    }
  })
}

// Fetch raw messages from a thread (for copying)
async function fetchRawMessages(threadId: string): Promise<RawMastraMessage[]> {
  try {
    const response = await mastraClient.getThreadMessages(threadId, {
      agentId: AGENT_ID,
    })
    const messageList = response?.messages || response || []
    return Array.isArray(messageList) ? messageList : []
  } catch (error) {
    // Thread might not exist yet, return empty array
    console.log(`No messages found for thread ${threadId}:`, error)
    return []
  }
}

// Find the 'main' thread ID for a resource
async function findMainThreadId(resourceId: string): Promise<string | null> {
  try {
    const response = await mastraClient.getMemoryThreads({
      resourceId,
      agentId: AGENT_ID,
    })
    const threadList = response?.threads || response || []
    const threads = Array.isArray(threadList) ? threadList : []

    // Look for a thread with id 'main' or that was created by workflows
    const mainThread = threads.find((t: MastraThread) =>
      t.id === MAIN_THREAD_ID ||
      t.id === 'main' ||
      t.metadata?.isWorkflowThread
    )
    return mainThread?.id || null
  } catch (error) {
    console.log(`Could not find main thread for resource ${resourceId}:`, error)
    return null
  }
}

// Generate a simple unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}


async function createMemoryThread(resourceId: string, weekId: string): Promise<MastraThread> {
  // Step 1: Find and fetch messages from the 'main' thread to branch from
  // First try to find the main thread in the resource's thread list
  let mainMessages: RawMastraMessage[] = []

  const mainThreadId = await findMainThreadId(resourceId)
  if (mainThreadId) {
    mainMessages = await fetchRawMessages(mainThreadId)
    console.log(`Found ${mainMessages.length} messages in thread ${mainThreadId} to branch`)
  } else {
    // Try fetching directly from 'main' thread ID as fallback
    mainMessages = await fetchRawMessages(MAIN_THREAD_ID)
    console.log(`Found ${mainMessages.length} messages in main thread (direct) to branch`)
  }

  // Step 2: Generate IDs for copied messages - we'll store the last one as the branch point
  const copiedMessageIds: string[] = mainMessages.map(() => generateId())
  const lastContextMessageId = copiedMessageIds.length > 0 ? copiedMessageIds[copiedMessageIds.length - 1] : null

  // Build metadata - store the last context message ID as the branch point
  const threadMetadata = {
    weekId,
    createdAt: new Date().toISOString(),
    branchedFrom: MAIN_THREAD_ID,
    branchedAt: new Date().toISOString(),
    branchMessageCount: mainMessages.length,
    // Store just the last copied message ID - all messages up to this are context
    lastContextMessageId,
  }

  // Step 3: Create the new thread
  const response = await mastraClient.createMemoryThread({
    resourceId,
    agentId: AGENT_ID,
    title: `Chat about ${weekId}`,
    metadata: threadMetadata,
  })
  const newThread = response?.thread || response

  // Step 4: Copy messages from main thread to new thread (in batches to avoid payload size limits)
  if (mainMessages.length > 0 && newThread?.id) {
    const copiedMessages = mainMessages.map((msg, index) => ({
      ...msg,
      id: copiedMessageIds[index],
      threadId: newThread.id,
    }))

    // Batch messages to avoid 413 Payload Too Large errors
    const BATCH_SIZE = 5
    let copiedCount = 0

    for (let i = 0; i < copiedMessages.length; i += BATCH_SIZE) {
      const batch = copiedMessages.slice(i, i + BATCH_SIZE)
      try {
        await mastraClient.saveMessageToMemory({
          messages: batch as any,
          agentId: AGENT_ID,
        })
        copiedCount += batch.length
      } catch (error) {
        console.error(`Failed to copy batch ${i / BATCH_SIZE + 1}:`, error)
        // Continue with remaining batches
      }
    }
    console.log(`Copied ${copiedCount}/${copiedMessages.length} messages to new thread ${newThread.id}`)
  }

  // Ensure metadata is included in the returned thread (Mastra response may not include it)
  return {
    ...newThread,
    metadata: {
      ...newThread?.metadata,
      ...threadMetadata,
    },
  }
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

  // Get active thread object
  const activeThread = threads.find(t => t.id === activeThreadId) || null

  // Query: Fetch messages for active thread
  const {
    data: serverMessages = [],
    isLoading: isLoadingMessages,
  } = useQuery({
    queryKey: ['messages', activeThreadId, activeThread?.lastContextMessageId],
    queryFn: () => {
      console.log(`[useMastraChat] Fetching messages for thread ${activeThreadId}, lastContextMessageId: ${activeThread?.lastContextMessageId}`)
      return fetchMessages(activeThreadId!, {
        lastContextMessageId: activeThread?.lastContextMessageId,
        branchMessageCount: activeThread?.branchMessageCount || 0,
      })
    },
    enabled: !!activeThreadId,
  })

  // Combine server messages with optimistic messages
  const messages = [...serverMessages, ...optimisticMessages]

  // Mutation: Create thread
  const createThreadMutation = useMutation({
    mutationFn: () => createMemoryThread(effectiveResourceId, weekId),
    onSuccess: (thread) => {
      // Add new thread to cache
      const branchMessageCount = (thread.metadata?.branchMessageCount as number) || 0
      console.log(`[useMastraChat] Thread created: ${thread.id}, metadata:`, thread.metadata, `branchMessageCount: ${branchMessageCount}`)
      queryClient.setQueryData<ChatThread[]>(
        ['threads', effectiveResourceId],
        (old = []) => [{
          id: thread.id,
          weekId,
          title: thread.title || 'New conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0,
          branchMessageCount,
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

  // Delete a thread
  const deleteThread = useCallback(async (threadId: string): Promise<boolean> => {
    try {
      // Use direct API call since mastraClient doesn't have deleteMemoryThread
      const response = await fetch(`http://localhost:6700/api/memory/threads/${threadId}?agentId=${AGENT_ID}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete thread: ${response.statusText}`)
      }

      // Remove from cache
      queryClient.setQueryData<ChatThread[]>(
        ['threads', effectiveResourceId],
        (old = []) => old.filter(t => t.id !== threadId)
      )

      // If we deleted the active thread, clear selection
      if (activeThreadId === threadId) {
        setActiveThreadId(null)
        setOptimisticMessages([])
      }

      return true
    } catch (err) {
      onError?.(formatError(err))
      return false
    }
  }, [effectiveResourceId, activeThreadId, queryClient, onError])

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
    deleteThread,
    messages,
    isLoadingMessages,
    isStreaming,
    streamingContent,
    sendMessage,
  }
}
