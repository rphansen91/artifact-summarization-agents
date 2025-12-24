import { useState, useEffect, useRef, useMemo } from 'react'
import type { ChatViewProps } from '../types'
import { ThreadSidebar } from './ThreadSidebar'
import { ChatMessage } from './ChatMessage'

interface ExtendedChatViewProps extends ChatViewProps {
  /** Whether a message is currently being streamed */
  isStreaming?: boolean
  /** Current streaming content for the assistant response */
  streamingContent?: string
  /** Whether messages are currently loading */
  isLoadingMessages?: boolean
  /** Called when user deletes a thread */
  onDeleteThread?: (threadId: string) => Promise<boolean>
}

/** Check if dev setting to show context messages is enabled */
function getShowContextMessagesSetting(): boolean {
  return localStorage.getItem('dev_showContextMessages') === 'true'
}

export function ChatView({
  week,
  threads,
  activeThread,
  messages,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
  onSendMessage,
  onViewArtifact,
  onBack,
  isStreaming = false,
  streamingContent = '',
  isLoadingMessages = false,
}: ExtendedChatViewProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const showContextMessages = getShowContextMessagesSetting()

  // Filter messages based on dev setting - hide context messages unless setting is on
  const displayMessages = useMemo(() => {
    const contextCount = messages.filter(msg => msg.isContextMessage).length
    const nonContextCount = messages.filter(msg => !msg.isContextMessage).length
    console.log(`[ChatView] Total messages: ${messages.length}, context: ${contextCount}, non-context: ${nonContextCount}, showContextMessages: ${showContextMessages}`)

    if (showContextMessages) {
      return messages
    }
    return messages.filter(msg => !msg.isContextMessage)
  }, [messages, showContextMessages])

  // Auto-scroll to bottom when new messages arrive or streaming updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages, streamingContent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isStreaming) {
      onSendMessage?.(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div className="flex h-full bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Thread Sidebar */}
      <ThreadSidebar
        week={week}
        threads={threads}
        activeThreadId={activeThread?.id ?? null}
        onSelectThread={onSelectThread}
        onCreateThread={onCreateThread}
        onDeleteThread={onDeleteThread}
        onBack={onBack}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {activeThread ? (
          <>
            {/* Chat Header */}
            <header className="shrink-0 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 drag-region">
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {activeThread.title}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {activeThread.messageCount} messages
              </p>
            </header>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-zinc-500">Loading messages...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {displayMessages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        onViewArtifact={onViewArtifact}
                      />
                    ))}
                    {/* Streaming indicator */}
                    {isStreaming && streamingContent && (
                      <div className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          AI
                        </div>
                        <div className="flex-1 max-w-[85%]">
                          <div className="inline-block text-left rounded-2xl px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm">
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                              {streamingContent}
                              <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Typing indicator when streaming starts but no content yet */}
                    {isStreaming && !streamingContent && (
                      <div className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          AI
                        </div>
                        <div className="flex-1">
                          <div className="inline-flex items-center gap-1 rounded-2xl px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-tl-sm">
                            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <footer className="shrink-0 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSubmit(e)
                        }
                      }}
                      placeholder="Ask about this week's work..."
                      rows={1}
                      disabled={isStreaming}
                      className="w-full px-4 py-3 pr-12 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isStreaming}
                    className="shrink-0 w-10 h-10 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-xl transition-colors"
                  >
                    {isStreaming ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 text-center">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </form>
            </footer>
          </>
        ) : (
          /* Empty State - No Thread Selected */
          <div className="flex-1 flex flex-col">
            {/* Drag region for empty state */}
            <div className="h-10 shrink-0 drag-region" />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Select a conversation
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Choose an existing thread from the sidebar or start a new conversation to explore {week.label}'s artifacts.
              </p>
              <button
                onClick={onCreateThread}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Start new conversation
              </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
