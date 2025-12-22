# Application Shell

## Overview

Artifact Engine uses a sidebar navigation layout that can collapse to icons only. The sidebar provides persistent access to all four main sections while maximizing content area when collapsed.

## Navigation Structure

| Route | Label | Description |
|-------|-------|-------------|
| `/setup` | Setup | Initial configuration (default for first-time users) |
| `/capture` | Capture | Recording activity and status |
| `/contextualize` | Contextualize | AI enrichment settings and status |
| `/browse` | Browse & Review | Knowledge base navigation |

## User Menu

Located at the bottom of the sidebar. Contains:
- User avatar (image or initials fallback)
- User name (visible when expanded)
- Settings option
- Logout option

When collapsed, shows only the avatar which expands on hover/click.

## Layout Pattern

Collapsible sidebar navigation on the left, main content area on the right.

**Expanded:** Full width with icons and labels (default on desktop)
**Collapsed:** Icons only, labels appear on hover (default on tablet)
**Mobile:** Sidebar hidden, accessible via hamburger menu overlay

## Design Notes

- Uses emerald as primary accent for active states
- Uses amber for secondary highlights (user avatar fallback)
- Uses zinc for neutral backgrounds and borders
- Space Grotesk for nav labels
- Inter for user name
- Icons from lucide-react
- Supports light and dark mode

## Components

### AppShell

Main layout wrapper that contains:
- Sidebar with logo, navigation, collapse toggle, and user menu
- Main content area for route content

**Props:**
```typescript
interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavigationItem[]
  user?: User
  onNavigate?: (href: string) => void
  onLogout?: () => void
  onSettings?: () => void
  defaultCollapsed?: boolean
}
```

### MainNav

Navigation menu with icons and labels.

**Props:**
```typescript
interface MainNavProps {
  items: NavigationItem[]
  isCollapsed: boolean
  onNavigate?: (href: string) => void
}
```

### UserMenu

User dropdown with avatar, settings, and logout.

**Props:**
```typescript
interface UserMenuProps {
  user: User
  isCollapsed: boolean
  onLogout?: () => void
  onSettings?: () => void
}
```

## Integration Notes

1. **Navigation:** Pass your router's navigate function to `onNavigate`
2. **Active State:** Set `isActive: true` on the current route's nav item
3. **User Data:** Pass authenticated user's name and optional avatar URL
4. **Icons:** Provide lucide-react icon components for each nav item
5. **Callbacks:** Wire up `onLogout` and `onSettings` to your auth system

## Example Usage

```tsx
import { AppShell } from './components/AppShell'
import { Settings, Camera, Sparkles, FolderOpen } from 'lucide-react'

const navItems = [
  { label: 'Setup', href: '/setup', icon: <Settings className="w-5 h-5" /> },
  { label: 'Capture', href: '/capture', icon: <Camera className="w-5 h-5" /> },
  { label: 'Contextualize', href: '/contextualize', icon: <Sparkles className="w-5 h-5" /> },
  { label: 'Browse & Review', href: '/browse', icon: <FolderOpen className="w-5 h-5" />, isActive: true },
]

<AppShell
  navigationItems={navItems}
  user={{ name: 'Alex Chen' }}
  onNavigate={(href) => router.push(href)}
  onLogout={() => auth.logout()}
>
  <YourPageContent />
</AppShell>
```
