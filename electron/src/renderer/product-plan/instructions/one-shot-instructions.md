# Artifact Engine — Complete Implementation Instructions

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

## Test-Driven Development

Each section includes a `tests.md` file with detailed test-writing instructions. These are **framework-agnostic** — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write failing tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

The test instructions include:
- Specific UI elements, button labels, and interactions to verify
- Expected success and failure behaviors
- Empty state handling (when no records exist yet)
- Data assertions and state validations

---

# Product Overview

## Summary

Artifact Engine automatically captures, contextualizes, and connects the natural output of your work—turning screenshots, commits, and ideas into a living knowledge base that compounds over time.

**Key Problems Solved:**
- **Work Disappears** — Frictionless capture grabs screenshots, git commits, and work artifacts as they happen
- **Documentation Is a Chore** — Work automatically generates its own documentation
- **Days and Weeks Feel Disconnected** — AI enriches each artifact with context and narrative
- **Knowledge Is Scattered** — Temporal structure creates a living library

## Data Model

**Core Entities:**
- **Artifact** — Captured work with AI-generated context
- **Week** — Temporal container grouping artifacts
- **Category** — Folder organizing artifacts by type
- **Repository** — Connected git repo for commit tracking
- **Workflow** — Configured automation (screenshot, git hook)

## Design System

- **Colors:** emerald (primary), amber (secondary), zinc (neutral)
- **Typography:** Space Grotesk (headings), Inter (body), JetBrains Mono (code)

---

# Milestone 1: Foundation

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

### 3. Routing Structure

| Route | Section |
|-------|---------|
| `/setup` | Setup wizard |
| `/capture` | Capture status |
| `/contextualize` | Week summaries and chat |
| `/browse` | Artifact browser |

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/`:

- `AppShell.tsx` — Main layout wrapper with collapsible sidebar
- `MainNav.tsx` — Navigation component
- `UserMenu.tsx` — User avatar dropdown

**Navigation Items:**
- Setup → `/setup`
- Capture → `/capture`
- Contextualize → `/contextualize`
- Browse & Review → `/browse`

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/` — Shell components

## Done When

- [ ] Design tokens are configured
- [ ] Data model types are defined
- [ ] Routes exist for all sections
- [ ] Shell renders with navigation
- [ ] Responsive on mobile
- [ ] Light and dark mode supported

---

# Milestone 2: Setup

## Goal

Implement the Setup wizard — a 4-step configuration flow for first-time users.

## Overview

Setup walks users through:
1. Select artifacts folder
2. Enter Mastra API key
3. Install screenshot automation
4. Connect git repositories

## Components

Copy from `product-plan/sections/setup/components/`:
- `SetupWizard.tsx`
- `StepIndicator.tsx`
- `Step1Folder.tsx`
- `Step2ApiKey.tsx`
- `Step3Automation.tsx`
- `Step4Repos.tsx`

## Key Callbacks

- `onSelectFolder` — Opens native file picker
- `onSaveApiKey` — Saves API key securely
- `onInstallAutomation` — Installs screenshot shortcut
- `onConnectRepo` / `onDisconnectRepo` — Manages git hooks
- `onNextStep` / `onPrevStep` — Wizard navigation
- `onComplete` — Finishes setup

## Expected User Flows

1. **Complete Initial Setup** — User walks through all 4 steps
2. **Skip Optional Steps** — User can skip automation and repos
3. **Edit Settings Later** — Setup accessible from navigation
4. **Connect New Repository** — Add repos after initial setup

## Files to Reference

- `product-plan/sections/setup/` — Components, types, test instructions

---

# Milestone 3: Browse & Review

## Goal

Implement temporal navigation through the artifact collection.

## Overview

File-explorer-like interface:
- Sidebar: Collapsible folder tree (Year → Week → Category)
- Main area: Artifact grid/list with detail view
- Navigation: Breadcrumbs for hierarchy

## Components

Copy from `product-plan/sections/browse-review/components/`:
- `ArtifactBrowser.tsx`
- `FolderTree.tsx`
- `FolderTreeNode.tsx`
- `Breadcrumbs.tsx`
- `ArtifactCard.tsx`
- `ArtifactDetail.tsx`

## Key Callbacks

- `onToggleFolder` — Expand/collapse folders
- `onSelectFolder` — Select category to view
- `onSelectArtifact` — Open artifact detail
- `onNavigateBreadcrumb` — Navigate up hierarchy
- `onToggleViewMode` — Switch grid/list view

## Expected User Flows

1. **Browse by Category** — Navigate tree, view artifacts
2. **View Artifact Detail** — Click card, see image + markdown
3. **Switch View Modes** — Toggle grid/list
4. **Navigate via Breadcrumbs** — Go back up hierarchy

## Files to Reference

- `product-plan/sections/browse-review/` — Components, types, test instructions

---

# Milestone 4: Contextualize

## Goal

Implement week-scoped AI summaries and chat interface.

## Overview

Two main views:
1. **Week List** — Cards with summaries and stats
2. **Chat View** — Conversational exploration of artifacts

## Components

Copy from `product-plan/sections/contextualize/components/`:
- `WeekList.tsx`
- `WeekCard.tsx`
- `ChatView.tsx`
- `ChatMessage.tsx`
- `ThreadSidebar.tsx`

## Key Callbacks

**WeekList:**
- `onViewWeek` — Open week detail
- `onGenerateSummary` — Trigger AI summary
- `onStartChat` — Open chat view

**ChatView:**
- `onSelectThread` — Switch threads
- `onCreateThread` — New conversation
- `onSendMessage` — Send to AI
- `onViewArtifact` — Open referenced artifact
- `onBack` — Return to week list

## Expected User Flows

1. **View Weeks and Summaries** — Browse week cards
2. **Generate Summary** — Trigger AI for pending weeks
3. **Start Chat** — Open conversation for a week
4. **View Referenced Artifact** — Click artifact in chat
5. **Switch Threads** — Manage multiple conversations

## Files to Reference

- `product-plan/sections/contextualize/` — Components, types, test instructions

---

# Implementation Checklist

## Foundation
- [ ] Design tokens configured
- [ ] Data model types defined
- [ ] Routing structure set up
- [ ] Application shell working
- [ ] Navigation functional

## Setup
- [ ] Setup wizard complete
- [ ] Folder selection works
- [ ] API key saves securely
- [ ] Automation installs
- [ ] Repository connection works

## Browse & Review
- [ ] Folder tree renders
- [ ] Artifact grid/list works
- [ ] Artifact detail shows
- [ ] Breadcrumbs navigate
- [ ] Empty states display

## Contextualize
- [ ] Week list renders
- [ ] Summary generation works
- [ ] Chat interface works
- [ ] Threads manageable
- [ ] Artifact references clickable

## Cross-cutting
- [ ] Tests written and passing
- [ ] Empty states for all sections
- [ ] Loading states for async
- [ ] Error handling
- [ ] Dark mode support
- [ ] Mobile responsive
