import type { ChatMessage as ChatMessageType, ReferencedArtifact } from '../types'

interface ChatMessageProps {
  message: ChatMessageType
  onViewArtifact?: (artifactId: string) => void
}

function ArtifactTypeIcon({ type }: { type: ReferencedArtifact['type'] }) {
  if (type === 'commit') {
    return (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    )
  }
  if (type === 'screenshot') {
    return (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    )
  }
  // idea
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  )
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function ChatMessage({ message, onViewArtifact }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isContextMessage = message.isContextMessage

  // Simple markdown-like formatting for bold text
  const formatContent = (content: string) => {
    // Split by ** for bold text
    const parts = content.split(/\*\*(.*?)\*\*/g)
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-semibold">{part}</strong>
      }
      return part
    })
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} ${isContextMessage ? 'opacity-60' : ''}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        isUser
          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
      }`}>
        {isUser ? 'You' : 'AI'}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        {/* Context message indicator */}
        {isContextMessage && (
          <div className={`mb-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Week Context
          </div>
        )}
        <div className={`inline-block text-left rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-emerald-500 dark:bg-emerald-600 text-white rounded-tr-sm'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'
        } ${isContextMessage ? 'border-2 border-dashed border-amber-400 dark:border-amber-600' : ''}`}>
          {/* Message text with line breaks */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {formatContent(message.content)}
          </div>
        </div>

        {/* Referenced Artifacts */}
        {message.referencedArtifacts.length > 0 && (
          <div className={`mt-2 flex flex-wrap gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {message.referencedArtifacts.map((artifact) => (
              <button
                key={artifact.id}
                onClick={() => onViewArtifact?.(artifact.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-lg hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
              >
                <span className="text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-500">
                  <ArtifactTypeIcon type={artifact.type} />
                </span>
                <span className="max-w-[180px] truncate">{artifact.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className={`mt-1.5 text-xs text-zinc-400 dark:text-zinc-500 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}
