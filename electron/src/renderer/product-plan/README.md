# Artifact Engine - Implementation Package

This package contains everything needed to implement Artifact Engine from the design specifications.

## Quick Start

### Option 1: One-Shot Implementation

Use this approach to implement the entire product in one session:

1. Open `prompts/one-shot-prompt.md`
2. Copy the prompt into your coding agent (Claude, Cursor, etc.)
3. Attach `instructions/one-shot-instructions.md` as context
4. Follow the agent's questions about your tech stack

### Option 2: Incremental Implementation

Build section-by-section for better control:

1. Open `prompts/section-prompt.md`
2. Start with Foundation milestone: `instructions/incremental/01-foundation.md`
3. Progress through each section in order
4. Reference the corresponding section folder for components and tests

## Package Contents

```
product-plan/
├── README.md                    # This file
├── product-overview.md          # Product summary
│
├── prompts/                     # Ready-to-use prompts
│   ├── one-shot-prompt.md       # Full implementation prompt
│   └── section-prompt.md        # Incremental prompt template
│
├── instructions/                # Implementation guides
│   ├── one-shot-instructions.md # All milestones combined
│   └── incremental/             # Per-milestone instructions
│       ├── 01-foundation.md     # Design system, routing, shell
│       ├── 02-setup.md          # Setup wizard
│       ├── 03-browse-review.md  # Artifact browser
│       └── 04-contextualize.md  # Weekly summaries & chat
│
├── design-system/               # Visual design tokens
│   ├── README.md
│   ├── tokens.css               # CSS custom properties
│   ├── tailwind-colors.md       # Color usage guide
│   └── fonts.md                 # Typography guide
│
├── data-model/                  # Core entities
│   ├── README.md
│   └── types.ts                 # TypeScript interfaces
│
├── shell/                       # Application shell
│   └── components/
│       ├── AppShell.tsx
│       ├── MainNav.tsx
│       ├── UserMenu.tsx
│       └── index.ts
│
└── sections/                    # Feature sections
    ├── setup/
    │   ├── README.md
    │   ├── tests.md
    │   ├── types.ts
    │   ├── sample-data.json
    │   └── components/
    │
    ├── browse-review/
    │   ├── README.md
    │   ├── tests.md
    │   ├── types.ts
    │   ├── sample-data.json
    │   └── components/
    │
    └── contextualize/
        ├── README.md
        ├── tests.md
        ├── types.ts
        ├── sample-data.json
        └── components/
```

## Implementation Order

1. **Foundation** - Design tokens, data model, routing, shell layout
2. **Setup** - First-run wizard for configuration
3. **Browse & Review** - Temporal navigation and artifact viewing
4. **Contextualize** - Weekly summaries and AI chat

## Tech Stack Flexibility

The components are written in React with Tailwind CSS. They can be adapted to:

- **Frameworks**: Next.js, Remix, Vite, Create React App
- **State Management**: Your choice (React Query, Zustand, Redux, etc.)
- **Backend**: Connect to your preferred API layer
- **Database**: Adapt the types to your ORM/database

## Design System

| Token | Value |
|-------|-------|
| Primary | `emerald` |
| Secondary | `amber` |
| Neutral | `zinc` |
| Heading Font | Space Grotesk |
| Body Font | Inter |
| Mono Font | JetBrains Mono |

All components support light and dark mode via Tailwind's `dark:` prefix.

## Testing

Each section includes a `tests.md` file with:

- Unit test specifications for each component
- Integration test scenarios
- User flow tests
- Edge cases and empty states
- Accessibility requirements

Follow TDD: write tests first, then implement to make them pass.

## Need Help?

- Review the section README files for component documentation
- Check the instruction files for implementation details
- Refer to `product-overview.md` for product context
