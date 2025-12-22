import { FolderTree } from './FolderTree'
import { useBrowse } from '../../contexts/BrowseContext'

export function BrowseSidebar() {
  const {
    folderTree,
    currentView,
    onToggleFolder,
    onSelectFolder,
  } = useBrowse()

  return (
    <FolderTree
      nodes={folderTree}
      selectedId={currentView.selectedFolderId}
      onToggleFolder={onToggleFolder}
      onSelectFolder={onSelectFolder}
    />
  )
}
