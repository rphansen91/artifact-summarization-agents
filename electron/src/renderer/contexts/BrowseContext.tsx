import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import type { FolderNode, Artifact, CurrentView, ViewMode, Breadcrumb } from '../components/browse/types'
import { useArtifactsQuery } from '../hooks'

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
  refetch: () => void
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

  // Use React Query for artifacts data
  const {
    folderTree: queryFolderTree,
    artifacts,
    isLoading,
    error,
    refetch,
  } = useArtifactsQuery({
    refetchInterval: 5000, // Poll every 5 seconds for new artifacts
    refetchOnWindowFocus: true,
  })

  // Maintain local folder tree state for expansion tracking
  const [folderTree, setFolderTree] = useState<FolderNode[]>([])

  const [currentView, setCurrentView] = useState<CurrentView>({
    type: 'folder',
    viewMode: 'grid',
    breadcrumbs: [{ id: 'root', name: 'Artifacts', type: 'root' }],
  })
  const initialWeekId = useRef(searchParams.get('weekId'))
  const hasInitialNavigated = useRef(false)

  // Sync query folder tree to local state, preserving expansion state
  useEffect(() => {
    if (queryFolderTree.length > 0) {
      setFolderTree(prevTree => {
        // If no previous tree, just use the query result
        if (prevTree.length === 0) {
          return queryFolderTree
        }

        // Merge expansion state from previous tree
        const mergeExpansionState = (newNodes: FolderNode[], oldNodes: FolderNode[]): FolderNode[] => {
          return newNodes.map(newNode => {
            const oldNode = oldNodes.find(n => n.id === newNode.id)
            return {
              ...newNode,
              isExpanded: oldNode?.isExpanded ?? newNode.isExpanded,
              children: newNode.children && oldNode?.children
                ? mergeExpansionState(newNode.children, oldNode.children)
                : newNode.children,
            }
          })
        }

        return mergeExpansionState(queryFolderTree, prevTree)
      })
    }
  }, [queryFolderTree])

  // Navigate to initial week from URL params after loading, or auto-select most recent week
  useEffect(() => {
    if (!isLoading && folderTree.length > 0 && !hasInitialNavigated.current) {
      hasInitialNavigated.current = true
      let targetWeekId: string | null = initialWeekId.current
      let weekNode: FolderNode | null = null
      let yearNode: FolderNode | null = null

      if (targetWeekId) {
        // Find the week specified in URL params
        for (const year of folderTree) {
          if (year.children) {
            const week = year.children.find(w => w.id === targetWeekId)
            if (week) {
              weekNode = week
              yearNode = year
              break
            }
          }
        }
      } else {
        // No URL param - auto-select the most recent week (first year's first week)
        for (const year of folderTree) {
          if (year.children && year.children.length > 0) {
            yearNode = year
            weekNode = year.children[0]
            targetWeekId = weekNode.id
            break
          }
        }
      }

      if (weekNode && yearNode && targetWeekId) {
        const breadcrumbs: Breadcrumb[] = [
          { id: 'root', name: 'Artifacts', type: 'root' },
          { id: yearNode.id, name: yearNode.name, type: 'year' },
          { id: weekNode.id, name: weekNode.name, type: 'week' },
        ]

        setCurrentView({
          type: 'folder',
          viewMode: 'grid',
          selectedFolderId: targetWeekId,
          breadcrumbs,
        })

        // Expand the year and week nodes
        const yearId = yearNode.id
        const weekId = targetWeekId
        setFolderTree(prevTree => {
          return prevTree.map(year => {
            if (year.id === yearId) {
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
      }

      // Clear URL params if there were any
      if (searchParams.has('weekId')) {
        setSearchParams({})
      }
    }
  }, [isLoading, folderTree, searchParams, setSearchParams])

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
    refetch,
  }

  return (
    <BrowseContext.Provider value={value}>
      {children}
    </BrowseContext.Provider>
  )
}
