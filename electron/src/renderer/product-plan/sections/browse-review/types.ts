// =============================================================================
// Data Types
// =============================================================================

export type FolderNodeType = 'year' | 'week' | 'category'

export type BreadcrumbType = 'root' | 'year' | 'week' | 'category' | 'artifact'

export type ViewMode = 'grid' | 'list'

export interface FolderNode {
  id: string
  name: string
  type: FolderNodeType
  isExpanded?: boolean
  itemCount?: number
  children?: FolderNode[]
}

export interface Breadcrumb {
  id: string
  name: string
  type: BreadcrumbType
}

export interface Artifact {
  id: string
  name: string
  title: string
  categoryId: string
  weekId: string
  weekName: string
  categoryName: string
  imagePath: string
  markdownPath: string
  markdownContent: string
  fileTypes: string[]
  createdAt: string
}

export interface CurrentView {
  type: 'folder' | 'artifact'
  viewMode: ViewMode
  selectedFolderId?: string
  selectedArtifactId?: string
  breadcrumbs: Breadcrumb[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface BrowseReviewProps {
  /** The hierarchical folder tree for sidebar navigation */
  folderTree: FolderNode[]
  /** All artifacts available for display */
  artifacts: Artifact[]
  /** Current view state (selected folder, view mode, breadcrumbs) */
  currentView: CurrentView

  /** Called when user expands or collapses a folder node */
  onToggleFolder?: (folderId: string) => void
  /** Called when user selects a folder to view its contents */
  onSelectFolder?: (folderId: string) => void
  /** Called when user clicks an artifact to view its detail */
  onSelectArtifact?: (artifactId: string) => void
  /** Called when user clicks a breadcrumb to navigate */
  onNavigateBreadcrumb?: (breadcrumbId: string) => void
  /** Called when user toggles between grid and list view */
  onToggleViewMode?: (mode: ViewMode) => void
}
