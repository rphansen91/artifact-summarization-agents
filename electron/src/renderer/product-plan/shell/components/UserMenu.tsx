import { useState, useRef, useEffect } from 'react'
import { Settings, LogOut } from 'lucide-react'
import type { User } from './AppShell'

interface UserMenuProps {
  user: User
  isCollapsed: boolean
  onLogout?: () => void
  onSettings?: () => void
}

export function UserMenu({ user, isCollapsed, onLogout, onSettings }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div ref={menuRef} className="relative border-t border-zinc-200 dark:border-zinc-800 p-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center w-full rounded-md p-2 transition-colors
          hover:bg-zinc-100 dark:hover:bg-zinc-800
          ${isCollapsed ? 'justify-center' : 'gap-3'}
        `}
      >
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-sm font-medium">
            {initials}
          </div>
        )}

        {/* Name */}
        {!isCollapsed && (
          <span
            className="flex-1 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {user.name}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute bottom-full mb-2 rounded-md border border-zinc-200 dark:border-zinc-700
            bg-white dark:bg-zinc-800 shadow-lg py-1 min-w-[160px]
            ${isCollapsed ? 'left-full ml-2' : 'left-2 right-2'}
          `}
        >
          {onSettings && (
            <button
              onClick={() => {
                onSettings()
                setIsOpen(false)
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          )}
          {onLogout && (
            <button
              onClick={() => {
                onLogout()
                setIsOpen(false)
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          )}
        </div>
      )}
    </div>
  )
}
