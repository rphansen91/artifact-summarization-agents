import type { NavigationItem } from './AppShell'

interface MainNavProps {
  items: NavigationItem[]
  isCollapsed: boolean
  onNavigate?: (href: string) => void
}

export function MainNav({ items, isCollapsed, onNavigate }: MainNavProps) {
  return (
    <nav className="px-2 space-y-1">
      {items.map((item) => (
        <button
          key={item.href}
          onClick={() => onNavigate?.(item.href)}
          className={`
            flex items-center w-full rounded-md transition-colors
            ${isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2 gap-3'}
            ${
              item.isActive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            }
          `}
          title={isCollapsed ? item.label : undefined}
        >
          <span className={`flex-shrink-0 ${item.isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
            {item.icon}
          </span>
          {!isCollapsed && (
            <span
              className="text-sm font-medium"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {item.label}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
