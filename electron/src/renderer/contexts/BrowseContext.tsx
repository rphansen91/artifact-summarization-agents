import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import type { FolderNode, Artifact, CurrentView, ViewMode, Breadcrumb } from '../components/browse/types'

interface BrowseContextValue {
  folderTree: FolderNode[]
  artifacts: Artifact[]
  currentView: CurrentView
  isLoading: boolean
  error: string | null
  onToggleFolder: (folderId: string) => void
  onSelectFolder: (folderId: string) => void
  onSelectWeek: (weekId: string) => void
  onSelectArtifact: (artifactId: string) => void
  onNavigateBreadcrumb: (breadcrumbId: string) => void
  onToggleViewMode: (mode: ViewMode) => void
  onStartChat: (weekId: string) => void
}

const BrowseContext = createContext<BrowseContextValue | null>(null)

export function useBrowse() {
  const context = useContext(BrowseContext)
  if (!context) {
    throw new Error('useBrowse must be used within a BrowseProvider')
  }
  return context
}

interface BrowseProviderProps {
  children: ReactNode
}

export function BrowseProvider({ children }: BrowseProviderProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [folderTree, setFolderTree] = useState<FolderNode[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<CurrentView>({
    type: 'folder',
    viewMode: 'grid',
    breadcrumbs: [{ id: 'root', name: 'Artifacts', type: 'root' }],
  })
  const initialWeekId = useRef(searchParams.get('weekId'))

  // Load artifacts from the main process
  useEffect(() => {
    async function loadArtifacts() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await window.electronAPI.getArtifacts()
        if (result.success) {
          setFolderTree(result.folderTree || [])
          setArtifacts(result.artifacts || [])
        } else {
          setError(result.error || 'Failed to load artifacts')
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    loadArtifacts()
  }, [])

  // Navigate to initial week from URL params after loading
  useEffect(() => {
    if (!isLoading && folderTree.length > 0 && initialWeekId.current) {
      // Find the week in the tree
      let found = false
      for (const year of folderTree) {
        if (year.children) {
          const week = year.children.find(w => w.id === initialWeekId.current)
          if (week) {
            found = true
            break
          }
        }
      }

      if (found) {
        // Build breadcrumbs and expand tree for the week
        let weekNode: FolderNode | null = null
        let yearNode: FolderNode | null = null

        for (const year of folderTree) {
          if (year.children) {
            const week = year.children.find(w => w.id === initialWeekId.current)
            if (week) {
              weekNode = week
              yearNode = year
              break
            }
          }
        }

        if (weekNode && yearNode) {
          const breadcrumbs: Breadcrumb[] = [
            { id: 'root', name: 'Artifacts', type: 'root' },
            { id: yearNode.id, name: yearNode.name, type: 'year' },
            { id: weekNode.id, name: weekNode.name, type: 'week' },
          ]

          setCurrentView({
            type: 'folder',
            viewMode: 'grid',
            selectedFolderId: initialWeekId.current,
            breadcrumbs,
          })

          // Expand the year and week nodes
          setFolderTree(prevTree => {
            return prevTree.map(year => {
              if (year.id === yearNode!.id) {
                return {
                  ...year,
                  isExpanded: true,
                  children: year.children?.map(week => {
                    if (week.id === initialWeekId.current) {
                      return { ...week, isExpanded: true }
                    }
                    return week
                  }),
                }
              }
              return year
            })
          })
        }
      }

      // Clear the ref so this doesn't run again
      initialWeekId.current = null
      // Clear URL params
      setSearchParams({})
    }
  }, [isLoading, folderTree, setSearchParams])

  // Find a node in the folder tree
  const findNode = useCallback((nodes: FolderNode[], id: string): FolderNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNode(node.children, id)
        if (found) return found
      }
    }
    return null
  }, [])

  // Find parent path to a node
  const findParentPath = useCallback((nodes: FolderNode[], targetId: string, path: FolderNode[] = []): FolderNode[] | null => {
    for (const node of nodes) {
      if (node.id === targetId) {
        return path
      }
      if (node.children) {
        const result = findParentPath(node.children, targetId, [...path, node])
        if (result) return result
      }
    }
    return null
  }, [])

  // Toggle folder expansion
  const onToggleFolder = useCallback((folderId: string) => {
    setFolderTree(prevTree => {
      const toggleNode = (nodes: FolderNode[]): FolderNode[] => {
        return nodes.map(node => {
          if (node.id === folderId) {
            return { ...node, isExpanded: !node.isExpanded }
          }
          if (node.children) {
            return { ...node, children: toggleNode(node.children) }
          }
          return node
        })
      }
      return toggleNode(prevTree)
    })
  }, [])

  // Select a folder (category)
  const onSelectFolder = useCallback((folderId: string) => {
    const node = findNode(folderTree, folderId)
    if (!node || node.type !== 'category') return

    const parentPath = findParentPath(folderTree, folderId) || []
    const breadcrumbs: Breadcrumb[] = [
      { id: 'root', name: 'Artifacts', type: 'root' },
      ...parentPath.map(n => ({
        id: n.id,
        name: n.name,
        type: n.type as Breadcrumb['type'],
      })),
      { id: node.id, name: node.name, type: 'category' },
    ]

    setCurrentView({
      type: 'folder',
      viewMode: currentView.viewMode,
      selectedFolderId: folderId,
      breadcrumbs,
    })

    // Expand parent nodes
    setFolderTree(prevTree => {
      const expandParents = (nodes: FolderNode[]): FolderNode[] => {
        return nodes.map(node => {
          const isInPath = parentPath.some(p => p.id === node.id)
          if (isInPath && !node.isExpanded) {
            return { ...node, isExpanded: true, children: node.children ? expandParents(node.children) : undefined }
          }
          if (node.children) {
            return { ...node, children: expandParents(node.children) }
          }
          return node
        })
      }
      return expandParents(prevTree)
    })
  }, [folderTree, findNode, findParentPath, currentView.viewMode])

  // Select a week (navigate to week view showing its categories)
  const onSelectWeek = useCallback((weekId: string) => {
    // Find the week node in the tree
    let weekNode: FolderNode | null = null
    let yearNode: FolderNode | null = null

    for (const year of folderTree) {
      if (year.children) {
        const week = year.children.find(w => w.id === weekId)
        if (week) {
          weekNode = week
          yearNode = year
          break
        }
      }
    }

    if (!weekNode || !yearNode) return

    // Build breadcrumbs: Root > Year > Week
    const breadcrumbs: Breadcrumb[] = [
      { id: 'root', name: 'Artifacts', type: 'root' },
      { id: yearNode.id, name: yearNode.name, type: 'year' },
      { id: weekNode.id, name: weekNode.name, type: 'week' },
    ]

    setCurrentView({
      type: 'folder',
      viewMode: currentView.viewMode,
      selectedFolderId: weekId,
      breadcrumbs,
    })

    // Expand the year and week nodes
    setFolderTree(prevTree => {
      return prevTree.map(year => {
        if (year.id === yearNode!.id) {
          return {
            ...year,
            isExpanded: true,
            children: year.children?.map(week => {
              if (week.id === weekId) {
                return { ...week, isExpanded: true }
              }
              return week
            }),
          }
        }
        return year
      })
    })

    // Clear the weekId from URL params after navigation
    if (searchParams.has('weekId')) {
      setSearchParams({})
    }
  }, [folderTree, currentView.viewMode, searchParams, setSearchParams])

  // Select an artifact
  const onSelectArtifact = useCallback((artifactId: string) => {
    const artifact = artifacts.find(a => a.id === artifactId)
    if (!artifact) return

    setCurrentView(prev => ({
      ...prev,
      type: 'artifact',
      selectedArtifactId: artifactId,
      breadcrumbs: [
        ...prev.breadcrumbs.filter(b => b.type !== 'artifact'),
        { id: artifactId, name: artifact.name, type: 'artifact' },
      ],
    }))
  }, [artifacts])

  // Navigate via breadcrumb
  const onNavigateBreadcrumb = useCallback((breadcrumbId: string) => {
    if (breadcrumbId === 'root') {
      setCurrentView({
        type: 'folder',
        viewMode: currentView.viewMode,
        breadcrumbs: [{ id: 'root', name: 'Artifacts', type: 'root' }],
      })
      return
    }

    const breadcrumbIndex = currentView.breadcrumbs.findIndex(b => b.id === breadcrumbId)
    if (breadcrumbIndex === -1) return

    const breadcrumb = currentView.breadcrumbs[breadcrumbIndex]
    const newBreadcrumbs = currentView.breadcrumbs.slice(0, breadcrumbIndex + 1)

    if (breadcrumb.type === 'category') {
      setCurrentView({
        type: 'folder',
        viewMode: currentView.viewMode,
        selectedFolderId: breadcrumbId,
        breadcrumbs: newBreadcrumbs,
      })
    } else if (breadcrumb.type === 'year' || breadcrumb.type === 'week') {
      setCurrentView({
        type: 'folder',
        viewMode: currentView.viewMode,
        breadcrumbs: newBreadcrumbs,
      })
    }
  }, [currentView])

  // Toggle view mode
  const onToggleViewMode = useCallback((mode: ViewMode) => {
    setCurrentView(prev => ({ ...prev, viewMode: mode }))
  }, [])

  // Navigate to chat for a week
  const onStartChat = useCallback((weekId: string) => {
    navigate(`/chat?weekId=${encodeURIComponent(weekId)}`)
  }, [navigate])

  const value: BrowseContextValue = {
    folderTree,
    artifacts,
    currentView,
    isLoading,
    error,
    onToggleFolder,
    onSelectFolder,
    onSelectWeek,
    onSelectArtifact,
    onNavigateBreadcrumb,
    onToggleViewMode,
    onStartChat,
  }

  return (
    <BrowseContext.Provider value={value}>
      {children}
    </BrowseContext.Provider>
  )
}
