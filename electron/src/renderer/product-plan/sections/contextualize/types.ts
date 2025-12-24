// =============================================================================
// Data Types
// =============================================================================

export interface WeekStats {
  commits: number
  screenshots: number
  ideas: number
  topCategory: string
}

export interface WeekSummary {
  status: 'pending' | 'generating' | 'generated'
  generatedAt: string | null
  narrative: string | null
  highlights: string[]
  stats: WeekStats
}

export interface Week {
  id: string
  label: string
  dateRange: string
  year: number
  artifactCount: number
  categories: string[]
  summary: WeekSummary
  threadCount: number
}

export interface ChatThread {
  id: string
  weekId: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
  /** Number of messages copied from main thread as context (legacy fallback) */
  branchMessageCount?: number
  /** ID of the last context message - all messages up to this are context */
  lastContextMessageId?: string | null
}

export interface ReferencedArtifact {
  id: string
  type: 'commit' | 'screenshot' | 'idea'
  title: string
  category: string
}

export interface ChatMessage {
  id: string
  threadId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  referencedArtifacts: ReferencedArtifact[]
  /** Whether this message was copied from the main thread as context */
  isContextMessage?: boolean
}

// =============================================================================
// Component Props
// =============================================================================

export interface WeekListProps {
  /** The list of weeks to display in the grid/list view */
  weeks: Week[]
  /** Called when user wants to view a week's details */
  onViewWeek?: (weekId: string) => void
  /** Called when user triggers summary generation for a week */
  onGenerateSummary?: (weekId: string) => void
  /** Called when user wants to start a new chat for a week */
  onStartChat?: (weekId: string) => void
}

export interface WeekSummaryViewProps {
  /** The week to display the summary for */
  week: Week
  /** Called when user triggers summary regeneration */
  onRegenerateSummary?: () => void
  /** Called when user wants to start a new chat */
  onStartChat?: () => void
  /** Called when user wants to view an existing chat thread */
  onViewThread?: (threadId: string) => void
}

export interface ChatViewProps {
  /** The week this chat is scoped to */
  week: Week
  /** All chat threads for this week */
  threads: ChatThread[]
  /** The currently active thread */
  activeThread: ChatThread | null
  /** Messages in the active thread */
  messages: ChatMessage[]
  /** Called when user selects a different thread */
  onSelectThread?: (threadId: string) => void
  /** Called when user creates a new thread */
  onCreateThread?: () => void
  /** Called when user deletes a thread */
  onDeleteThread?: (threadId: string) => Promise<boolean>
  /** Called when user sends a message */
  onSendMessage?: (content: string) => void
  /** Called when user wants to view a referenced artifact */
  onViewArtifact?: (artifactId: string) => void
  /** Called when user navigates back to week view */
  onBack?: () => void
}
