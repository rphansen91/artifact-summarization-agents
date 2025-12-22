# Milestone 4: Contextualize

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, Milestone 3 (Browse & Review) recommended

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

Implement the Contextualize feature — week-scoped AI enrichment with summaries and conversational exploration.

## Overview

Contextualize provides two main views:
1. **Week List** — Shows all weeks with their summaries, stats, and ability to trigger summary generation
2. **Chat View** — Full-page chat interface for asking questions about a specific week's artifacts

**Key Functionality:**
- Week cards showing narrative summaries and highlights
- Summary statistics (commits, screenshots, ideas)
- Summary generation trigger (manual or automatic)
- Chat interface scoped to individual weeks
- Multiple chat threads per week
- Artifact references in chat responses
- Thread sidebar for conversation management

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/contextualize/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/contextualize/components/`:

- `WeekList.tsx` — Main week grid with stats and empty state
- `WeekCard.tsx` — Individual week card with summary and actions
- `ChatView.tsx` — Full chat interface with sidebar and messages
- `ChatMessage.tsx` — Individual chat message with artifact references
- `ThreadSidebar.tsx` — Thread list sidebar for chat view

### Data Layer

The components expect these data shapes:

```typescript
interface Week {
  id: string
  label: string
  dateRange: string
  year: number
  artifactCount: number
  categories: string[]
  summary: WeekSummary
  threadCount: number
}

interface WeekSummary {
  status: 'pending' | 'generating' | 'generated'
  generatedAt: string | null
  narrative: string | null
  highlights: string[]
  stats: WeekStats
}

interface WeekStats {
  commits: number
  screenshots: number
  ideas: number
  topCategory: string
}

interface ChatThread {
  id: string
  weekId: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

interface ChatMessage {
  id: string
  threadId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  referencedArtifacts: ReferencedArtifact[]
}

interface ReferencedArtifact {
  id: string
  type: 'commit' | 'screenshot' | 'idea'
  title: string
  category: string
}
```

You'll need to:
- Aggregate week data from artifact folder structure
- Implement AI summary generation (Mastra integration)
- Store and retrieve chat threads and messages
- Parse AI responses for artifact references
- Manage chat history per week

### Callbacks

Wire up these user actions:

**WeekList:**
| Callback | Description |
|----------|-------------|
| `onViewWeek` | Opens week detail view |
| `onGenerateSummary` | Triggers AI summary generation |
| `onStartChat` | Opens chat view for the week |

**ChatView:**
| Callback | Description |
|----------|-------------|
| `onSelectThread` | Switches to different thread |
| `onCreateThread` | Creates new chat thread |
| `onSendMessage` | Sends message to AI |
| `onViewArtifact` | Opens referenced artifact |
| `onBack` | Returns to week list |

### Empty States

Implement empty state UI for:

- **No weeks captured yet:** Show message encouraging user to capture artifacts
- **Week with pending summary:** Show CTA to generate summary
- **No chat threads yet:** Show prompt to start first conversation
- **No active thread selected:** Show message to select or create thread

## Files to Reference

- `product-plan/sections/contextualize/README.md` — Feature overview and design intent
- `product-plan/sections/contextualize/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/contextualize/components/` — React components
- `product-plan/sections/contextualize/types.ts` — TypeScript interfaces
- `product-plan/sections/contextualize/sample-data.json` — Test data
- `product-plan/sections/contextualize/*.png` — Visual references

## Expected User Flows

### Flow 1: View Weeks and Summaries

1. User navigates to Contextualize section
2. Page header shows total artifacts and summarized count
3. Weeks are grouped by year, most recent first
4. Summarized weeks show narrative and highlights
5. Pending weeks show artifact count and "Summarize" button
6. **Outcome:** User sees overview of all their weeks

### Flow 2: Generate Week Summary

1. User sees a week with "Pending" status
2. User clicks "Summarize" button on week card
3. Status changes to "Generating..." with animation
4. AI processes week's artifacts
5. Status updates to "Summarized" with narrative and highlights
6. **Outcome:** Week now has AI-generated summary

### Flow 3: Start Chat Conversation

1. User clicks "Chat" button on a week card
2. Chat view opens with thread sidebar
3. If no threads exist, empty state shows "Start new conversation"
4. User clicks "New conversation" button
5. New thread is created and selected
6. User types question and presses Enter
7. AI responds with context from week's artifacts
8. **Outcome:** User can ask questions about their work

### Flow 4: View Referenced Artifact

1. User is reading an AI response in chat
2. Response includes referenced artifact badges
3. User clicks on an artifact badge (e.g., "feat: implement TokenRefreshMiddleware")
4. Artifact detail view opens (from Browse & Review)
5. User can see the full artifact with image and summary
6. **Outcome:** User can explore artifacts mentioned in chat

### Flow 5: Switch Chat Threads

1. User has multiple chat threads for a week
2. User clicks different thread in sidebar
3. Chat area updates to show that thread's messages
4. User can continue the previous conversation
5. **Outcome:** User manages multiple lines of inquiry

### Flow 6: Return to Week List

1. User is in chat view
2. User clicks "Back to weeks" in sidebar header
3. View returns to week list
4. **Outcome:** User navigates between views

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Week list renders with correct grouping
- [ ] Week cards show summaries and stats
- [ ] Summary generation works (with AI integration)
- [ ] Chat view renders correctly
- [ ] Messages send and receive properly
- [ ] Thread sidebar works
- [ ] Artifact references are clickable
- [ ] Empty states display when appropriate
- [ ] Loading states during AI operations
- [ ] Dark mode styling works
- [ ] Matches the visual design
- [ ] Responsive on mobile
