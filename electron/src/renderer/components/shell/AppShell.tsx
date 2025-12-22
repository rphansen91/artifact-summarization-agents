import { useState } from 'react'
import { MainNav } from './MainNav'

export interface NavigationItem {
  label: string
  href: string
  icon: React.ReactNode
  isActive?: boolean
}

export interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  onNavigate?: (href: string) => void
  defaultCollapsed?: boolean
  /** Optional custom sidebar content to render below navigation */
  sidebarContent?: React.ReactNode
}

export function AppShell({
  children,
  navigationItems,
  onNavigate,
  defaultCollapsed = false,
  sidebarContent,
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside
        className={`
          flex flex-col border-r border-zinc-200 dark:border-zinc-800
          bg-white dark:bg-zinc-900 transition-all duration-200
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Draggable spacer for macOS traffic lights */}
        <div
          className="h-10 flex-shrink-0"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        />

        {/* Navigation */}
        <div className="py-2">
          <MainNav
            items={navigationItems}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        </div>

        {/* Custom Sidebar Content (e.g., folder tree for Browse) */}
        {sidebarContent && !isCollapsed && (
          <div className="flex-1 overflow-y-auto border-t border-zinc-200 dark:border-zinc-800">
            {sidebarContent}
          </div>
        )}

        {/* Collapse Toggle */}
        <div className="mt-auto">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center h-10 w-full mx-2 mb-2 rounded-md
              text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100
              dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800
              transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Draggable top bar overlay */}
        <div
          className="absolute top-0 left-0 right-0 h-10 z-10"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        />
        {children}
      </main>
    </div>
  )
}
