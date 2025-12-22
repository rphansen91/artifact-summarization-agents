# Milestone 2: Setup

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

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

Implement the Setup feature — a guided wizard shown on first run that walks users through configuring their Artifact Engine.

## Overview

Setup is a 4-step wizard that configures the application:
1. Select artifacts folder (where captured work is stored)
2. Enter Mastra API key (for AI analysis)
3. Install screenshot automation (keyboard shortcut)
4. Connect git repositories (for commit tracking)

**Key Functionality:**
- Step-by-step wizard with progress indicator
- Native file picker integration for folder selection
- Secure API key input with show/hide toggle
- One-click automation installation
- Repository browser with connect/disconnect
- After first run, accessible as settings page

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/setup/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/setup/components/`:

- `SetupWizard.tsx` — Main wizard container with header/footer navigation
- `StepIndicator.tsx` — Progress stepper showing current step
- `Step1Folder.tsx` — Folder selection UI
- `Step2ApiKey.tsx` — API key input UI
- `Step3Automation.tsx` — Automation installation UI
- `Step4Repos.tsx` — Repository connection UI

### Data Layer

The components expect these data shapes:

```typescript
interface SetupConfig {
  artifactsFolder: string
  artifactsFolderSet: boolean
  apiKey: string
  apiKeySet: boolean
  automationInstalled: boolean
  automationPlatform: 'mac' | 'windows' | 'linux'
  currentStep: number
  isComplete: boolean
}

interface Repository {
  id: string
  name: string
  path: string
  isConnected: boolean
  lastCommitDate: string
  commitCount: number
}

interface Workflow {
  id: string
  name: string
  type: 'screenshot' | 'git-hook'
  isInstalled: boolean
  shortcut?: string
  platform: 'mac' | 'windows' | 'linux' | 'cross-platform'
}
```

You'll need to:
- Persist configuration to local storage or database
- Implement native file picker dialog
- Store API key securely (never expose in logs)
- Detect platform for appropriate automation
- Scan for git repositories on the system
- Install/uninstall git hooks

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onSelectFolder` | Opens native file picker dialog |
| `onFolderChange` | Updates folder path |
| `onSaveApiKey` | Saves API key securely |
| `onInstallAutomation` | Installs screenshot automation |
| `onUninstallAutomation` | Removes screenshot automation |
| `onConnectRepo` | Adds git hook to repository |
| `onDisconnectRepo` | Removes git hook from repository |
| `onBrowseRepo` | Opens folder picker to add new repo |
| `onGoToStep` | Navigates to specific step |
| `onNextStep` | Advances to next step |
| `onPrevStep` | Goes back to previous step |
| `onComplete` | Completes setup, redirects to Browse |

### Empty States

Handle cases where:
- No folder selected yet (show file picker CTA)
- No repositories found (show browse button)
- Automation not available on current platform

## Files to Reference

- `product-plan/sections/setup/README.md` — Feature overview and design intent
- `product-plan/sections/setup/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/setup/components/` — React components
- `product-plan/sections/setup/types.ts` — TypeScript interfaces
- `product-plan/sections/setup/sample-data.json` — Test data
- `product-plan/sections/setup/*.png` — Visual references

## Expected User Flows

### Flow 1: Complete Initial Setup

1. User opens app for first time, sees Setup wizard on Step 1
2. User clicks "Click to Browse" button to select folder
3. Native file picker opens, user selects folder
4. Folder path displays with checkmark, "Continue" button enables
5. User clicks "Continue" to go to Step 2
6. User enters API key, clicks "Save API Key"
7. User clicks "Continue" to go to Step 3
8. User clicks "Install Automation" (optional)
9. User clicks "Continue" to go to Step 4
10. User clicks "Connect" on repositories they want to track
11. User clicks "Complete Setup"
12. **Outcome:** User is redirected to Browse & Review section

### Flow 2: Skip Optional Steps

1. User completes Step 1 (folder) and Step 2 (API key)
2. On Step 3, user clicks "Continue" without installing automation
3. On Step 4, user clicks "Complete Setup" without connecting repos
4. **Outcome:** Setup completes with minimal configuration

### Flow 3: Edit Settings Later

1. User navigates to Setup from shell navigation
2. User sees their current configuration
3. User can navigate to any step to modify settings
4. User can install/uninstall automation
5. User can connect/disconnect repositories
6. **Outcome:** Configuration updates persist

### Flow 4: Connect New Repository

1. User is on Step 4 with some repos already connected
2. User clicks "Browse for Another Repository"
3. Native folder picker opens
4. User selects a git repository folder
5. New repository appears in "Available" list
6. User clicks "Connect" on new repository
7. **Outcome:** Repository moves to "Connected" list, git hook installed

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Setup wizard renders on first launch
- [ ] All 4 steps function correctly
- [ ] Step progress indicator shows correct state
- [ ] Folder selection works via native picker
- [ ] API key saves securely
- [ ] Automation can be installed/uninstalled
- [ ] Repositories can be connected/disconnected
- [ ] Configuration persists across sessions
- [ ] Setup accessible as settings page after completion
- [ ] Matches the visual design
- [ ] Responsive on mobile
