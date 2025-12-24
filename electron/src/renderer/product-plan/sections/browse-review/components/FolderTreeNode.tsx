import { ChevronRight, Folder, FolderOpen, Calendar, Code, Terminal, Cpu, Boxes, Bot, FileText } from 'lucide-react'
import type { FolderNode } from '../types'

interface FolderTreeNodeProps {
  node: FolderNode
  depth?: number
  selectedId?: string
  onToggle?: (id: string) => void
  onSelect?: (id: string) => void
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '1-Code': Code,
  '2-Terminal': Terminal,
  '3-Performance': Cpu,
  '4-Architecture': Boxes,
  '5-AI_Agents': Bot,
}

export function FolderTreeNode({
  node,
  depth = 0,
  selectedId,
  onToggle,
  onSelect
}: FolderTreeNodeProps) {
  const isSelected = node.id === selectedId
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = node.isExpanded
  const isCategory = node.type === 'category'

  // Get the appropriate icon
  const CategoryIcon = isCategory ? (categoryIcons[node.name] || FileText) : null

  const handleClick = () => {
    if (isCategory) {
      onSelect?.(node.id)
    } else if (hasChildren) {
      onToggle?.(node.id)
    }
  }

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      onToggle?.(node.id)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className={`
          group flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-left
          transition-all duration-150
          ${isSelected
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* Expand/collapse chevron */}
        {hasChildren ? (
          <span
            onClick={handleChevronClick}
            className={`
              flex-shrink-0 p-0.5 rounded transition-transform duration-200
              ${isExpanded ? 'rotate-90' : ''}
              hover:bg-zinc-700/50
            `}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span className="w-4.5" />
        )}

        {/* Icon */}
        {node.type === 'year' && (
          <Calendar className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
        )}
        {node.type === 'week' && (
          isExpanded
            ? <FolderOpen className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-amber-500'}`} />
            : <Folder className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-amber-500/70'}`} />
        )}
        {isCategory && CategoryIcon && (
          <CategoryIcon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
        )}

        {/* Label */}
        <span
          className={`
            flex-1 truncate text-sm
            ${node.type === 'year' ? 'font-semibold' : ''}
            ${node.type === 'week' ? 'font-medium' : ''}
          `}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {node.name.replace(/_/g, ' ')}
        </span>

        {/* Item count badge */}
        {isCategory && typeof node.itemCount === 'number' && node.itemCount > 0 && (
          <span
            className={`
              px-1.5 py-0.5 text-xs rounded-full
              ${isSelected
                ? 'bg-emerald-500/30 text-emerald-300'
                : 'bg-zinc-700 text-zinc-400 group-hover:bg-zinc-600'
              }
            `}
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {node.itemCount}
          </span>
        )}
      </button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {node.children!.map(child => (
            <FolderTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
