import { FolderTreeNode } from './FolderTreeNode'
import type { FolderNode } from '../types'

interface FolderTreeProps {
  nodes: FolderNode[]
  selectedId?: string
  onToggleFolder?: (folderId: string) => void
  onSelectFolder?: (folderId: string) => void
}

export function FolderTree({
  nodes,
  selectedId,
  onToggleFolder,
  onSelectFolder
}: FolderTreeProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <h2
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Artifacts Browser
        </h2>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {nodes.map(node => (
          <FolderTreeNode
            key={node.id}
            node={node}
            selectedId={selectedId}
            onToggle={onToggleFolder}
            onSelect={onSelectFolder}
          />
        ))}
      </div>
    </div>
  )
}
