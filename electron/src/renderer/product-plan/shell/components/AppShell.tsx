import { useState } from 'react'
import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'

export interface NavigationItem {
  label: string
  href: string
  icon: React.ReactNode
  isActive?: boolean
}

export interface User {
  name: string
  avatarUrl?: string
}

export interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  user?: User
  onNavigate?: (href: string) => void
  onLogout?: () => void
  onSettings?: () => void
  defaultCollapsed?: boolean
}

export function AppShell({
  children,
  navigationItems,
  user,
  onNavigate,
  onLogout,
  onSettings,
  defaultCollapsed = false,
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
        {/* Logo / Header */}
        <div className="flex h-14 items-center border-b border-zinc-200 dark:border-zinc-800 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-sm">
              AE
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-zinc-900 dark:text-zinc-100" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Artifact Engine
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <MainNav
            items={navigationItems}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center h-10 mx-2 mb-2 rounded-md
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

        {/* User Menu */}
        {user && (
          <UserMenu
            user={user}
            isCollapsed={isCollapsed}
            onLogout={onLogout}
            onSettings={onSettings}
          />
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
