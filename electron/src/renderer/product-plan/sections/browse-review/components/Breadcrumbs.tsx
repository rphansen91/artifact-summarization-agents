import { ChevronRight, Home } from 'lucide-react'
import type { Breadcrumb } from '../types'

interface BreadcrumbsProps {
  items: Breadcrumb[]
  onNavigate?: (id: string) => void
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const isFirst = index === 0

        return (
          <div key={item.id} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            )}
            <button
              onClick={() => onNavigate?.(item.id)}
              disabled={isLast}
              className={`
                flex items-center gap-1.5 px-1.5 py-0.5 rounded
                transition-colors duration-150
                ${isLast
                  ? 'text-zinc-200 cursor-default'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }
              `}
            >
              {isFirst && <Home className="w-3.5 h-3.5" />}
              <span className={isLast ? 'font-medium' : ''}>{item.name}</span>
            </button>
          </div>
        )
      })}
    </nav>
  )
}
