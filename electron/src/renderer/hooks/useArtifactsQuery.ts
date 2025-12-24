import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { FolderNode, Artifact } from '../components/browse/types'

export interface ArtifactsResult {
  folderTree: FolderNode[]
  artifacts: Artifact[]
}

export const ARTIFACTS_QUERY_KEY = ['artifacts'] as const

async function fetchArtifacts(): Promise<ArtifactsResult> {
  const result = await window.electronAPI.getArtifacts()
  if (!result.success) {
    throw new Error(result.error || 'Failed to load artifacts')
  }
  return {
    folderTree: result.folderTree || [],
    artifacts: result.artifacts || [],
  }
}

export interface UseArtifactsQueryOptions {
  /** Refetch interval in milliseconds. Set to false to disable. Default: 5000 (5 seconds) */
  refetchInterval?: number | false
  /** Whether to refetch when the window regains focus. Default: true */
  refetchOnWindowFocus?: boolean
}

export interface UseArtifactsQueryReturn {
  folderTree: FolderNode[]
  artifacts: Artifact[]
  isLoading: boolean
  error: string | null
  refetch: () => void
  /** Returns true if a new artifact was added since the last check */
  hasNewArtifact: (previousCount: number) => boolean
}

export function useArtifactsQuery(options: UseArtifactsQueryOptions = {}): UseArtifactsQueryReturn {
  const {
    refetchInterval = 5000,
    refetchOnWindowFocus = true,
  } = options

  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ARTIFACTS_QUERY_KEY,
    queryFn: fetchArtifacts,
    refetchInterval,
    refetchOnWindowFocus,
    staleTime: 1000, // Consider data stale after 1 second to ensure fresh data
  })

  const hasNewArtifact = (previousCount: number): boolean => {
    const currentCount = query.data?.artifacts.length ?? 0
    return currentCount > previousCount
  }

  return {
    folderTree: query.data?.folderTree ?? [],
    artifacts: query.data?.artifacts ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: () => queryClient.invalidateQueries({ queryKey: ARTIFACTS_QUERY_KEY }),
    hasNewArtifact,
  }
}

/** Hook to get just the artifact count - useful for detecting new artifacts */
export function useArtifactCount(): number {
  const queryClient = useQueryClient()
  const data = queryClient.getQueryData<ArtifactsResult>(ARTIFACTS_QUERY_KEY)
  return data?.artifacts.length ?? 0
}

/** Utility to invalidate artifacts cache from anywhere */
export function useInvalidateArtifacts() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ARTIFACTS_QUERY_KEY })
}
