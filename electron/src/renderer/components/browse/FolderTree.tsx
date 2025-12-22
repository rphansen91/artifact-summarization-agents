import { FolderTreeNode } from './FolderTreeNode'
import type { FolderNode } from './types'

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
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h2
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Artifacts Browser
        </h2>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {nodes.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <p className="text-sm text-zinc-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              No artifacts found
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Artifacts will appear here as they are captured
            </p>
          </div>
        ) : (
          nodes.map(node => (
            <FolderTreeNode
              key={node.id}
              node={node}
              selectedId={selectedId}
              onToggle={onToggleFolder}
              onSelect={onSelectFolder}
            />
          ))
        )}
      </div>
    </div>
  )
}
