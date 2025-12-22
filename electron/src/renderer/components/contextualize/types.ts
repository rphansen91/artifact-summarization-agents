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
  fullContent: string | null
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

export interface WeekCardProps {
  week: Week
  onView?: () => void
  onGenerateSummary?: () => void
  onStartChat?: () => void
}
