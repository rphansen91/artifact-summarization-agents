# Artifact Engine — Product Overview

## Summary

Artifact Engine automatically captures, contextualizes, and connects the natural output of your work—turning screenshots, commits, and ideas into a living knowledge base that compounds over time.

**Key Problems Solved:**
- **Work Disappears** — Frictionless capture grabs screenshots, git commits, and work artifacts as they happen—no manual documentation required.
- **Documentation Is a Chore** — Work automatically generates its own documentation. Artifacts emerge from your natural workflow, not interruptions to it.
- **Days and Weeks Feel Disconnected** — A week-scoped AI agent enriches each artifact with context, creating narrative continuity across your work.
- **Knowledge Is Scattered and Static** — Artifacts are stored in a temporal structure (`year/week/category/`) that grows into a living library of case studies, content, and training data.

## Planned Sections

1. **Setup** — Initial configuration: select artifacts folder, add API key for Mastra agents, create system automation (Mac Automator/Windows equivalent), and add git post-commit hooks to selected repos.

2. **Capture** — Frictionless recording of screenshots, git commits, and work artifacts as they happen through the configured automations.

3. **Contextualize** — Week-scoped AI enrichment that connects artifacts with narrative continuity and deeper meaning.

4. **Browse & Review** — Temporal navigation through your knowledge base, viewing artifacts by week, category, and connections.

## Data Model

**Core Entities:**
- **Artifact** — A captured piece of work (screenshot, commit, idea) with AI-generated context, filed into a category folder within a week.
- **Week** — A temporal container (`Week_47_Nov17-Nov23`) that groups artifacts by category and includes a summary of the week's work.
- **Category** — A folder within a week (Code, Terminal, Performance, Architecture, AI_Agents, Product, Client_Work, Random) that organizes artifacts by type.
- **Repository** — A git repo the user has connected for commit tracking via post-commit hooks.
- **Workflow** — A configured automation (screenshot capture shortcut, git hook) that generates artifacts.

**Relationships:**
- Week has many Categories
- Category has many Artifacts
- Repository generates Artifacts (via git hooks)
- Workflow generates Artifacts
- Week has one Summary (the `summary.md` file)

## Design System

**Colors:**
- Primary: `emerald` — Used for buttons, links, key accents
- Secondary: `amber` — Used for tags, highlights, secondary elements
- Neutral: `zinc` — Used for backgrounds, text, borders

**Typography:**
- Heading: Space Grotesk
- Body: Inter
- Mono: JetBrains Mono

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, routing structure, and application shell
2. **Setup** — Guided wizard for initial configuration (folder, API key, automations, git hooks)
3. **Browse & Review** — Temporal navigation through artifacts by year, week, and category
4. **Contextualize** — AI-powered weekly summaries and chat interface for exploring artifacts

Each milestone has a dedicated instruction document in `product-plan/instructions/`.
