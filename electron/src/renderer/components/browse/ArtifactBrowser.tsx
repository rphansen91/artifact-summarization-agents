import { LayoutGrid, List, FolderOpen } from 'lucide-react'
import { Breadcrumbs } from './Breadcrumbs'
import { ArtifactCard } from './ArtifactCard'
import { ArtifactDetail } from './ArtifactDetail'
import type { Artifact, CurrentView, ViewMode } from './types'

interface ArtifactBrowserContentProps {
  /** All artifacts available for display */
  artifacts: Artifact[]
  /** Current view state (selected folder, view mode, breadcrumbs) */
  currentView: CurrentView
  /** Called when user clicks an artifact to view its detail */
  onSelectArtifact?: (artifactId: string) => void
  /** Called when user clicks a breadcrumb to navigate */
  onNavigateBreadcrumb?: (breadcrumbId: string) => void
  /** Called when user toggles between grid and list view */
  onToggleViewMode?: (mode: ViewMode) => void
}

export function ArtifactBrowser({
  artifacts,
  currentView,
  onSelectArtifact,
  onNavigateBreadcrumb,
  onToggleViewMode
}: ArtifactBrowserContentProps) {
  // Get artifacts for current folder
  const folderArtifacts = currentView.selectedFolderId
    ? artifacts.filter(a => a.categoryId === currentView.selectedFolderId)
    : []

  // Get selected artifact for detail view
  const selectedArtifact = currentView.selectedArtifactId
    ? artifacts.find(a => a.id === currentView.selectedArtifactId)
    : null

  const handleViewModeToggle = (mode: ViewMode) => {
    onToggleViewMode?.(mode)
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {/* Header bar */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 relative z-20"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <Breadcrumbs
          items={currentView.breadcrumbs}
          onNavigate={onNavigateBreadcrumb}
        />

        {/* View mode toggle (only show for folder view) */}
        {currentView.type === 'folder' && (
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50">
            <button
              onClick={() => handleViewModeToggle('grid')}
              className={`
                p-2 rounded-md transition-all duration-150
                ${currentView.viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50'
                }
              `}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4 pointer-events-none" />
            </button>
            <button
              onClick={() => handleViewModeToggle('list')}
              className={`
                p-2 rounded-md transition-all duration-150
                ${currentView.viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-300/50 dark:hover:bg-zinc-700/50'
                }
              `}
              title="List view"
            >
              <List className="w-4 h-4 pointer-events-none" />
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentView.type === 'artifact' && selectedArtifact ? (
          <ArtifactDetail artifact={selectedArtifact} />
        ) : currentView.type === 'folder' ? (
          folderArtifacts.length > 0 ? (
            <div
              className={
                currentView.viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'flex flex-col gap-2'
              }
            >
              {folderArtifacts.map(artifact => (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  viewMode={currentView.viewMode}
                  onSelect={() => onSelectArtifact?.(artifact.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-zinc-300/20 dark:bg-zinc-700/20 blur-3xl rounded-full" />
                <FolderOpen className="w-16 h-16 text-zinc-400 dark:text-zinc-700 relative" />
              </div>
              <h3
                className="mt-4 text-lg font-medium text-zinc-600 dark:text-zinc-400"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                No artifacts yet
              </h3>
              <p
                className="mt-1 text-sm text-zinc-500 dark:text-zinc-600"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                This folder is empty. Artifacts will appear here as they're captured.
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full" />
              <FolderOpen className="w-16 h-16 text-zinc-400 dark:text-zinc-600 relative" />
            </div>
            <h3
              className="mt-4 text-lg font-medium text-zinc-600 dark:text-zinc-400"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Select a folder
            </h3>
            <p
              className="mt-1 text-sm text-zinc-500 dark:text-zinc-600"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Choose a category from the sidebar to view its artifacts.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
