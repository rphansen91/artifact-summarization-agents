# Contextualize Section

## Overview

Week-scoped AI enrichment that generates summaries and enables conversational exploration of your captured work. Users can trigger weekly summaries (also auto-generated) and start chat conversations to ask questions about artifacts from a specific week.

## User Flows

- Trigger weekly summary generation from the week list/grid view
- View weekly summary showing narrative recap plus highlights and stats
- Start a new chat conversation scoped to a specific week
- Ask questions about work artifacts within the chat interface
- View and switch between multiple chat threads for a week via sidebar in chat view

## Components

| Component | Description |
|-----------|-------------|
| `WeekList` | Grid of weeks with summary status and actions |
| `WeekCard` | Individual week card showing summary and stats |
| `ChatView` | Full-page chat interface for conversational queries |
| `ChatMessage` | Individual message bubble with artifact references |
| `ThreadSidebar` | Sidebar showing conversation threads for a week |

## Props Pattern

All components accept data and callbacks via props. The main entry points are `WeekList` and `ChatView`:

```tsx
interface WeekListProps {
  weeks: Week[]
  onViewWeek?: (weekId: string) => void
  onGenerateSummary?: (weekId: string) => void
  onStartChat?: (weekId: string) => void
}

interface ChatViewProps {
  week: Week
  threads: ChatThread[]
  activeThread: ChatThread | null
  messages: ChatMessage[]
  onSelectThread?: (threadId: string) => void
  onCreateThread?: () => void
  onSendMessage?: (content: string) => void
  onViewArtifact?: (artifactId: string) => void
  onBack?: () => void
}
```

## Sample Data

See `sample-data.json` for example data that matches the `types.ts` interfaces.

## Design Notes

- Uses the product design tokens (emerald/amber/zinc palette)
- Supports light and dark mode via Tailwind `dark:` variants
- Uses shell navigation (shell: true in config)
- Chat interface supports referencing artifacts inline
- Summaries include narrative text, highlights, and statistics
