# Contextualize Section - Test Instructions

## Overview

These test instructions guide TDD implementation of the Contextualize section. Write tests first, then implement to make them pass.

## Unit Tests

### WeekList Component

```
describe WeekList
  - renders all weeks as cards
  - sorts weeks by date (newest first)
  - calls onViewWeek when card is clicked
  - calls onGenerateSummary when summarize button clicked
  - calls onStartChat when chat button clicked
  - shows loading state while data loads
```

### WeekCard Component

```
describe WeekCard
  - renders week label and date range
  - shows artifact count stats
  - displays "Summarized" badge when summary exists
  - displays "Pending" badge when no summary
  - shows "Generating..." state during generation
  - renders summary narrative when available
  - shows highlights list (max 3)
  - displays category tags
  - shows thread count on chat button
```

### ChatView Component

```
describe ChatView
  - renders thread sidebar
  - renders message area
  - shows input field at bottom
  - displays active thread title
  - calls onSendMessage when form submitted
  - clears input after sending
  - shows empty state when no thread selected
  - calls onBack when back button clicked
```

### ChatMessage Component

```
describe ChatMessage
  - renders user messages aligned right
  - renders AI messages aligned left
  - shows avatar for sender
  - displays message content
  - shows timestamp
  - renders referenced artifacts as clickable chips
  - calls onViewArtifact when artifact clicked
  - supports bold text formatting with **
```

### ThreadSidebar Component

```
describe ThreadSidebar
  - renders week info header
  - shows "New conversation" button
  - lists all threads for the week
  - highlights active thread
  - shows message count per thread
  - shows relative date for each thread
  - calls onSelectThread when thread clicked
  - calls onCreateThread when new button clicked
  - shows empty state when no threads
```

## Integration Tests

### Summary Generation Flow

```
describe Summary Generation
  - clicking generate triggers summary creation
  - shows loading state during generation
  - displays summary when complete
  - updates week card with new status
  - handles generation errors gracefully
```

### Chat Conversation Flow

```
describe Chat Conversation
  - user can start new conversation from week card
  - user can type and send messages
  - AI response appears after user message
  - conversation persists in thread list
  - user can switch between threads
  - thread title updates based on first message
```

### Artifact References

```
describe Artifact References
  - AI can reference artifacts in responses
  - artifact chips are clickable
  - clicking opens artifact detail view
  - multiple artifacts can be referenced
```

## User Flow Tests

### View Weekly Summary

```
describe View Weekly Summary
  - user navigates to week with existing summary
  - summary narrative is displayed
  - highlights are listed
  - stats show artifact counts
  - can trigger re-generation if needed
```

### Start Chat About Week

```
describe Start Chat About Week
  - user clicks chat button on week card
  - chat view opens with week context
  - user can type question about artifacts
  - AI responds with relevant information
  - artifacts are referenced when applicable
```

### Manage Multiple Threads

```
describe Manage Multiple Threads
  - user can create multiple threads per week
  - threads are listed in sidebar
  - clicking thread loads its messages
  - active thread is visually highlighted
  - can navigate back to week list
```

## Edge Cases

```
describe Edge Cases
  - handles week with no artifacts
  - handles failed summary generation
  - manages very long messages
  - handles rapid message sending
  - manages threads with many messages
  - handles artifact references to deleted items
  - manages empty thread list
```

## Empty States

```
describe Empty States
  - shows prompt when no summary exists
  - shows message when no threads for week
  - shows guidance when chat is empty
  - provides clear call-to-action in each state
```

## Accessibility

```
describe Accessibility
  - chat input has accessible label
  - messages are properly structured for screen readers
  - thread list is keyboard navigable
  - artifact chips have descriptive labels
  - focus moves to new message after sending
  - Enter sends message, Shift+Enter adds new line
```
