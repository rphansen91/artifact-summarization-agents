# Milestone 3: Browse & Review

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, Milestone 2 (Setup) recommended

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Implement the Browse & Review feature — temporal navigation through the user's artifact collection.

## Overview

Browse & Review provides a file-explorer-like interface for navigating captured artifacts organized by Year → Week → Category. Users can browse the folder tree, view artifacts in grid or list mode, and see detailed views of individual artifacts.

**Key Functionality:**
- Collapsible folder tree in sidebar (Year → Week → Category)
- Item counts on category folders
- Grid and list view modes for artifacts
- Artifact cards with thumbnails and metadata
- Artifact detail view with image preview and markdown summary
- Breadcrumb navigation
- View-only experience (no edit/delete)

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/browse-review/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/browse-review/components/`:

- `ArtifactBrowser.tsx` — Main content area with header and artifact display
- `FolderTree.tsx` — Sidebar navigation tree container
- `FolderTreeNode.tsx` — Individual tree node (year, week, or category)
- `Breadcrumbs.tsx` — Breadcrumb navigation bar
- `ArtifactCard.tsx` — Artifact card for grid/list views
- `ArtifactDetail.tsx` — Full artifact detail view with image and markdown

### Data Layer

The components expect these data shapes:

```typescript
interface FolderNode {
  id: string
  name: string
  type: 'year' | 'week' | 'category'
  isExpanded?: boolean
  itemCount?: number
  children?: FolderNode[]
}

interface Artifact {
  id: string
  name: string
  title: string
  categoryId: string
  weekId: string
  weekName: string
  categoryName: string
  imagePath: string
  markdownPath: string
  markdownContent: string
  fileTypes: string[]
  createdAt: string
}

interface CurrentView {
  type: 'folder' | 'artifact'
  viewMode: 'grid' | 'list'
  selectedFolderId?: string
  selectedArtifactId?: string
  breadcrumbs: Breadcrumb[]
}
```

You'll need to:
- Read the artifact folder structure from disk
- Build the folder tree hierarchy
- Load artifact metadata and markdown content
- Track current navigation state
- Manage expand/collapse state of folders

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onToggleFolder` | Expands or collapses a folder node |
| `onSelectFolder` | Selects a category to view its contents |
| `onSelectArtifact` | Opens artifact detail view |
| `onNavigateBreadcrumb` | Navigates back up the hierarchy |
| `onToggleViewMode` | Switches between grid and list view |

### Empty States

Implement empty state UI for:

- **No artifacts captured yet:** Show helpful message encouraging user to capture their first artifact
- **Empty category folder:** Show message that artifacts will appear as they're captured
- **No folder selected:** Show prompt to select a category from the sidebar

## Files to Reference

- `product-plan/sections/browse-review/README.md` — Feature overview and design intent
- `product-plan/sections/browse-review/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/browse-review/components/` — React components
- `product-plan/sections/browse-review/types.ts` — TypeScript interfaces
- `product-plan/sections/browse-review/sample-data.json` — Test data
- `product-plan/sections/browse-review/*.png` — Visual references

## Expected User Flows

### Flow 1: Browse Artifacts by Category

1. User navigates to Browse & Review section
2. Sidebar shows folder tree with years expanded
3. User clicks a week folder to expand it
4. Week expands showing category folders with item counts
5. User clicks a category (e.g., "1-Code")
6. Main area shows artifacts in that category as a grid
7. Breadcrumbs update to show: Artifacts > Week_47 > 1-Code
8. **Outcome:** User sees all artifacts in selected category

### Flow 2: View Artifact Detail

1. User is viewing a category's artifacts in grid view
2. User clicks an artifact card
3. View switches to artifact detail
4. Breadcrumbs update to include artifact name
5. User sees image preview (left) and markdown summary (right)
6. File type badges show (.png, .md)
7. **Outcome:** User can read the AI-generated summary

### Flow 3: Switch View Modes

1. User is viewing artifacts in grid mode
2. User clicks list icon in view mode toggle
3. View switches to list mode (compact rows)
4. User sees artifact rows with thumbnails and metadata
5. User clicks grid icon to switch back
6. **Outcome:** View mode persists while browsing

### Flow 4: Navigate via Breadcrumbs

1. User is viewing an artifact detail
2. User clicks "Week_47" in breadcrumbs
3. View returns to that week's categories
4. User clicks "Artifacts" (root) in breadcrumbs
5. View returns to root, no folder selected
6. **Outcome:** User navigates up the hierarchy

### Flow 5: Collapse/Expand Folders

1. User sees expanded year folder in sidebar
2. User clicks chevron on year to collapse it
3. Year collapses, hiding week children
4. User clicks chevron again to expand
5. **Outcome:** Folder state toggles, children show/hide

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Folder tree renders with correct hierarchy
- [ ] Folders expand/collapse correctly
- [ ] Category selection shows artifacts in main area
- [ ] Grid and list views work correctly
- [ ] Artifact cards display correct metadata
- [ ] Artifact detail shows image and markdown
- [ ] Breadcrumbs navigate correctly
- [ ] Empty states display when appropriate
- [ ] Dark mode styling works
- [ ] Matches the visual design
- [ ] Responsive on mobile
