# Browse & Review Section

## Overview

Browse & Review provides temporal navigation through the user's artifact collection. Users navigate a tree-based folder structure (Year > Week > Category) to browse and view captured artifacts, which consist of screenshots paired with AI-generated markdown summaries sharing the same base filename.

## User Flows

- Browse the collapsible folder tree in the sidebar to navigate by year, week, and category
- Click a folder to see its contents in the main area as a grid or list
- Toggle between grid view (visual cards with thumbnails) and list view (compact with metadata)
- Click an artifact to view its detail page with the image preview and rendered markdown
- Use breadcrumbs to navigate back up the hierarchy

## Components

| Component | Description |
|-----------|-------------|
| `ArtifactBrowser` | Main browser container with sidebar and content area |
| `FolderTree` | Collapsible tree navigation for Year > Week > Category |
| `FolderTreeNode` | Individual tree node with expand/collapse functionality |
| `Breadcrumbs` | Navigation breadcrumbs showing current path |
| `ArtifactCard` | Card display for artifacts in grid/list view |
| `ArtifactDetail` | Detail view showing image preview and markdown |

## Props Pattern

All components accept data and callbacks via props. The main entry point is `ArtifactBrowser`:

```tsx
interface ArtifactBrowserProps {
  folders: FolderNode[]
  currentPath: string[]
  artifacts: Artifact[]
  selectedArtifact: Artifact | null
  viewMode: 'grid' | 'list'
  onNavigate?: (path: string[]) => void
  onSelectArtifact?: (artifact: Artifact) => void
  onViewModeChange?: (mode: 'grid' | 'list') => void
}
```

## Sample Data

See `sample-data.json` for example data that matches the `types.ts` interfaces.

## Design Notes

- Uses the product design tokens (emerald/amber/zinc palette)
- Supports light and dark mode via Tailwind `dark:` variants
- View-only experience (no edit or delete actions)
- Tree navigation is the primary discovery mechanism (no search/filter)
