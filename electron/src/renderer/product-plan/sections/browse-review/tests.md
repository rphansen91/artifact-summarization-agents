# Browse & Review Section - Test Instructions

## Overview

These test instructions guide TDD implementation of the Browse & Review section. Write tests first, then implement to make them pass.

## Unit Tests

### ArtifactBrowser Component

```
describe ArtifactBrowser
  - renders folder tree in sidebar
  - renders content area with artifacts
  - shows breadcrumbs reflecting current path
  - displays view mode toggle (grid/list)
  - calls onNavigate when folder is selected
  - calls onSelectArtifact when artifact is clicked
  - shows artifact detail when artifact is selected
```

### FolderTree Component

```
describe FolderTree
  - renders root level folders (years)
  - expands folder when clicked
  - collapses folder when clicked again
  - shows child folders when expanded
  - highlights currently selected folder
  - displays item count for folders with artifacts
```

### FolderTreeNode Component

```
describe FolderTreeNode
  - renders folder name and icon
  - shows expand chevron for folders with children
  - rotates chevron when expanded
  - shows item count badge when present
  - calls onToggle when clicked
  - indents children based on nesting level
```

### Breadcrumbs Component

```
describe Breadcrumbs
  - renders "Artifacts" as root
  - shows each path segment as clickable link
  - shows current location as non-clickable text
  - calls onNavigate with correct path when clicked
  - uses separator between segments
```

### ArtifactCard Component

```
describe ArtifactCard
  - renders thumbnail image
  - shows artifact title
  - displays file type badges (.png, .md)
  - shows capture date
  - calls onClick when card is clicked
  - adapts layout for grid vs list mode
```

### ArtifactDetail Component

```
describe ArtifactDetail
  - renders artifact title
  - shows file type badges
  - displays image preview card
  - renders markdown content
  - shows breadcrumb navigation
  - calls onBack when back button clicked
```

## Integration Tests

### Navigation Flow

```
describe Navigation Flow
  - user can navigate from year to week to category
  - breadcrumbs update as user navigates deeper
  - clicking breadcrumb navigates to that level
  - folder tree reflects current selection
  - back button returns to previous view
```

### View Modes

```
describe View Modes
  - defaults to grid view
  - toggles to list view when button clicked
  - persists view mode preference
  - artifacts display correctly in both modes
  - view mode toggle is accessible
```

### Artifact Selection

```
describe Artifact Selection
  - clicking artifact card shows detail view
  - detail view displays correct artifact
  - can return to list from detail view
  - maintains scroll position when returning
```

## User Flow Tests

### Browse by Time Period

```
describe Browse by Time Period
  - user can expand year to see weeks
  - user can expand week to see categories
  - selecting category shows artifacts in main area
  - empty folders show appropriate message
```

### View Artifact Details

```
describe View Artifact Details
  - clicking artifact opens detail view
  - image preview loads and displays
  - markdown content renders correctly
  - navigation breadcrumbs are accurate
  - can navigate away and back to same artifact
```

## Edge Cases

```
describe Edge Cases
  - handles empty artifact collection gracefully
  - handles folders with no artifacts
  - handles very deep folder hierarchies
  - manages artifacts with missing thumbnails
  - handles artifacts with missing markdown files
  - manages very long artifact titles
  - handles special characters in folder/file names
```

## Empty States

```
describe Empty States
  - shows welcome message when no artifacts exist
  - shows "No items" when folder is empty
  - provides guidance on how to capture artifacts
```

## Accessibility

```
describe Accessibility
  - folder tree is keyboard navigable
  - screen reader announces expanded/collapsed state
  - artifact cards have descriptive alt text
  - view mode toggle has accessible labels
  - focus management works correctly
  - breadcrumbs are navigable via keyboard
```
