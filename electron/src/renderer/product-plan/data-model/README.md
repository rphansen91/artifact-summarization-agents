# Data Model

## Entities

### Artifact
A captured piece of work (screenshot, commit, idea) with AI-generated context, filed into a category folder within a week. Artifacts are the core unit of the knowledge base.

### Week
A temporal container (`Week_47_Nov17-Nov23`) that groups artifacts by category and includes a summary of the week's work. Weeks form the "chapters" of the user's engineering life.

### Category
A folder within a week (Code, Terminal, Performance, Architecture, AI_Agents, Product, Client_Work, Random) that organizes artifacts by type.

### Repository
A git repo the user has connected for commit tracking via post-commit hooks. Repositories are configured during setup.

### Workflow
A configured automation (screenshot capture shortcut, git hook) that generates artifacts. Workflows run in the background without user intervention.

## Relationships

```
Week (1) ─────< Category (many)
Category (1) ─────< Artifact (many)
Repository (1) ─────< Artifact (many) [via git hooks]
Workflow (1) ─────< Artifact (many)
Week (1) ────── Summary (1)
```

- Week has many Categories
- Category has many Artifacts
- Repository generates Artifacts (via git hooks)
- Workflow generates Artifacts
- Week has one Summary (the `summary.md` file)

## Implementation Notes

The types defined in `types.ts` provide TypeScript interfaces for these entities. Sample data is provided in `sample-data.json` for development and testing.

Each section has its own types focused on that section's needs:
- **setup/** - Setup configuration, repositories, workflows
- **browse-review/** - Folder hierarchy, artifacts for browsing
- **contextualize/** - Weeks with summaries, chat threads, messages
