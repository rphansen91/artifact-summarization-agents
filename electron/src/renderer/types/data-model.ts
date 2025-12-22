/**
 * Artifact Engine - Core Data Model Types
 *
 * These are the shared entity types across all sections.
 * Each section may extend or subset these for their specific needs.
 */

// =============================================================================
// Core Entities
// =============================================================================

export interface Artifact {
  id: string
  title: string
  type: 'screenshot' | 'commit' | 'idea'
  category: Category
  weekId: string
  createdAt: string // ISO date string
  imagePath?: string
  markdownPath?: string
  summary?: string
}

export interface Week {
  id: string
  label: string // e.g., "Week 47"
  year: number
  dateRange: string // e.g., "Nov 17 - Nov 23"
  startDate: string // ISO date string
  endDate: string // ISO date string
  artifactCount: number
  categories: Category[]
  summary?: WeekSummary
}

export interface WeekSummary {
  status: 'pending' | 'generating' | 'generated'
  narrative?: string
  highlights: string[]
  stats: {
    commits: number
    screenshots: number
    ideas: number
  }
}

export type Category =
  | 'Code'
  | 'Terminal'
  | 'Performance'
  | 'Architecture'
  | 'AI_Agents'
  | 'Product'
  | 'Client_Work'
  | 'Random'

export interface Repository {
  id: string
  name: string
  path: string
  hookInstalled: boolean
  lastCommitAt?: string
}

export interface Workflow {
  id: string
  name: string
  type: 'screenshot' | 'git-hook'
  enabled: boolean
  installedAt?: string
}

// =============================================================================
// Chat Entities (Contextualize Section)
// =============================================================================

export interface ChatThread {
  id: string
  weekId: string
  title: string
  messageCount: number
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  threadId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  referencedArtifacts: ReferencedArtifact[]
}

export interface ReferencedArtifact {
  id: string
  title: string
  type: Artifact['type']
}

// =============================================================================
// Navigation Entities (Browse & Review Section)
// =============================================================================

export interface FolderNode {
  id: string
  name: string
  type: 'year' | 'week' | 'category'
  path: string[]
  itemCount?: number
  children?: FolderNode[]
}

// =============================================================================
// Setup Entities
// =============================================================================

export interface SetupConfig {
  artifactsFolder: string | null
  apiKey: string | null
  automationInstalled: boolean
  repositories: Repository[]
}

export interface SetupStep {
  id: string
  label: string
  description: string
  completed: boolean
}
