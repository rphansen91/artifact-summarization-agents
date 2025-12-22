# Milestone 1: Foundation

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

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

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Color Palette:**
- Primary: `emerald` — buttons, links, active states
- Secondary: `amber` — highlights, notifications, tags
- Neutral: `zinc` — backgrounds, text, borders

**Typography:**
- Headings: Space Grotesk (sans-serif)
- Body: Inter (sans-serif)
- Code/mono: JetBrains Mono (monospace)

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/types.ts` for interface definitions
- See `product-plan/data-model/README.md` for entity relationships

**Core Entities:**
- `Artifact` — Captured work with AI-generated context
- `Week` — Temporal container grouping artifacts
- `Category` — Folder organizing artifacts by type
- `Repository` — Connected git repo
- `Workflow` — Configured automation

### 3. Routing Structure

Create routes for each section:

| Route | Section |
|-------|---------|
| `/setup` | Setup wizard (default for first-time users) |
| `/capture` | Capture status and activity |
| `/contextualize` | Week summaries and chat |
| `/browse` | Artifact browser |

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper with collapsible sidebar
- `MainNav.tsx` — Navigation component with icons and labels
- `UserMenu.tsx` — User avatar dropdown with settings/logout

**Wire Up Navigation:**

Connect navigation to your routing. The shell expects these props:

```typescript
interface NavigationItem {
  label: string
  href: string
  icon: React.ReactNode
  isActive?: boolean
}

interface User {
  name: string
  avatarUrl?: string
}
```

**Navigation Items:**
- Setup → `/setup` — Settings/cog icon
- Capture → `/capture` — Camera icon
- Contextualize → `/contextualize` — Sparkles icon
- Browse & Review → `/browse` — Folder icon

**User Menu:**

The user menu expects:
- User name (for display and initials)
- Avatar URL (optional, shows initials if not provided)
- Logout callback
- Settings callback (optional)

**Shell Behavior:**
- Sidebar expands/collapses via toggle button
- Desktop: expanded by default
- Mobile: collapsed by default, overlay mode
- Active nav item highlighted in emerald

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens are configured (colors, fonts)
- [ ] Data model types are defined
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with navigation
- [ ] Navigation links to correct routes
- [ ] Active route is highlighted
- [ ] User menu shows user info
- [ ] Sidebar collapses/expands properly
- [ ] Responsive on mobile (sidebar overlay)
- [ ] Light and dark mode supported
