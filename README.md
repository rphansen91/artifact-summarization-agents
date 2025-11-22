# Artifact Summarization Engine

An intelligent screenshot categorization and documentation system that automatically processes macOS screenshots, analyzes their content with AI, and organizes them into a structured weekly artifact system.

## Features

- 🤖 **AI-Powered Analysis**: Uses GPT-4o to analyze screenshot content and extract technical details
- 📁 **Automatic Organization**: Saves screenshots and markdown summaries to categorized weekly folders
- 🔔 **Mac Integration**: Native macOS notifications and Automator integration
- 🏷️ **Smart Categorization**: Automatically classifies content into predefined categories
- 📝 **Structured Metadata**: Generates titles, descriptions, tags, and searchable content
- ⚡ **Real-time Processing**: Processes screenshots immediately after capture

## Architecture

Built with [Mastra](https://mastra.ai) - a TypeScript framework for AI workflows:

- **Workflows**: AI processing pipelines with structured input/output
- **Agents**: Specialized AI agents for screenshot analysis
- **Utilities**: Week management and file organization helpers
- **Integration**: macOS Automator and shell script automation

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd artifact-summarization

# Install dependencies
npm install

# Build the application
npm run build
```

### 2. Environment Setup

Set your artifacts base path (optional):
```bash
export TARGET_PATH="/Users/$(whoami)/Documents/Artifacts"
```

Default location: `~/Documents/Artifacts`

### 3. Start the Mastra Server

```bash
npm run dev
```

The server will start on `http://localhost:4111`

### 4. Set Up macOS Automator

1. Open **Automator** → Create new **Folder Action**
2. Choose your **Desktop** folder (or wherever screenshots are saved)
3. Add **Run Shell Script** action with this content:

```bash
#!/bin/zsh
for f in "$@"; do
    /Users/$(whoami)/Documents/rpjs/artifact-summarization/scripts/artifacts-categorize-file.sh "$f"
done
```

4. Save the action

## Folder Structure

The system organizes artifacts in a weekly structure:

```
~/Documents/Artifacts/
├── 2025/
│   ├── Week_47_Nov17-Nov23/
│   │   ├── 1-Code/
│   │   ├── 2-Terminal/
│   │   ├── 3-Performance/
│   │   ├── 4-Architecture/
│   │   ├── 5-AI_Agents/
│   │   ├── 6-Product/
│   │   ├── 7-Client_Work/
│   │   ├── 8-Random/
│   │   └── summary.md
│   └── Base_Week_Template/
└── ...
```

## Categories

Screenshots are automatically classified into these categories:

- **1-Code**: Source code, IDEs, programming interfaces, development tools
- **2-Terminal**: Command line interfaces, shell sessions, CLI tools, console output  
- **3-Performance**: Metrics, monitoring, profiling, benchmarks, analytics dashboards
- **4-Architecture**: System diagrams, infrastructure, database schemas, technical designs
- **5-AI_Agents**: AI tools, LLM interfaces, agent frameworks, AI development
- **6-Product**: UI/UX, product features, user interfaces, design systems
- **7-Client_Work**: Client-specific work, project deliverables, business applications
- **8-Random**: Miscellaneous technical content that doesn't fit other categories

## Workflows

### Auto Artifact Analysis Workflow

**Input:**
```json
{
  "image_path": "/path/to/screenshot.png",
  "notes": "Optional description"
}
```

**Output:**
```json
{
  "category": "1-Code",
  "filename": "development-screenshot.png", 
  "title": "Development Environment Setup",
  "markdown": "# Development Environment Setup\n\nDetailed analysis...",
  "tags": ["development", "vscode", "typescript"],
  "markdown_path": "/Users/.../Week_47_Nov17-Nov23/1-Code/development-screenshot.md",
  "image_path": "/Users/.../Week_47_Nov17-Nov23/1-Code/development-screenshot.png",
  "week_folder": "Week_47_Nov17-Nov23"
}
```

### Manual Workflow (Advanced)

For custom category lists and target paths:

```bash
curl -X POST http://localhost:4111/api/workflows/artifactAnalysisWorkflow/start \
  -H "Content-Type: application/json" \
  -d '{
    "image_path": "/path/to/screenshot.png",
    "notes": "Custom description",
    "target_path": "/custom/path",
    "categories": ["Custom-Cat1", "Custom-Cat2"]
  }'
```

## User Experience

1. **Take Screenshot** (⌘⇧3 or ⌘⇧4)
2. **Automator triggers** → Processing starts automatically
3. **Notes Dialog** → Add optional context (or skip)
4. **AI Analysis** → Screenshot analyzed and categorized
5. **Notification** → Shows title, category, and week folder
6. **Files Saved** → Screenshot and markdown saved to appropriate category folder

## Development

### Project Structure

```
src/
├── mastra/
│   ├── agents/
│   │   ├── artifact-agent.ts      # AI agent for screenshot analysis
│   │   └── weather-agent.ts       # Example agent
│   ├── tools/
│   │   └── weather-tool.ts        # Example tool
│   ├── workflows/
│   │   ├── auto-artifact-workflow.ts    # Main auto workflow
│   │   ├── artifact-analysis-workflow.ts # Manual workflow
│   │   └── weather-workflow.ts          # Example workflow
│   ├── utils/
│   │   └── week-utils.ts          # Week calculation utilities
│   └── index.ts                   # Mastra configuration
├── scripts/
│   └── artifacts-categorize-file.sh     # Automator integration script
├── package.json
└── tsconfig.json
```

### Key Components

**Week Utilities** (`src/mastra/utils/week-utils.ts`):
- `getCurrentWeekNumber()` - ISO week calculation
- `getCurrentWeekPath()` - Current week folder path
- `getCurrentWeekCategories()` - Auto-detect available categories
- `ensureCurrentWeekStructure()` - Create folder structure

**Artifact Agent** (`src/mastra/agents/artifact-agent.ts`):
- Specialized for technical screenshot analysis
- Uses GPT-4o for better vision capabilities
- Structured output with Zod schemas

**Auto Workflow** (`src/mastra/workflows/auto-artifact-workflow.ts`):
- Single-step processing with auto-detected paths
- Native Mac notifications
- Automatic file organization

### Adding New Categories

1. Update your week template structure:
```bash
mkdir -p ~/Documents/Artifacts/Base_Week_Template/9-NewCategory
```

2. The system will auto-detect new categories from existing week folders

### Customization

**Change AI Model:**
```typescript
// In src/mastra/agents/artifact-agent.ts
model: 'openai/gpt-4o-mini', // or other models
```

**Modify Categories:**
Update the folder structure in your Base_Week_Template

**Custom Prompts:**
Edit the analysis prompts in the workflow files

## Troubleshooting

### Debug Logging

The shell script has optional debug logging that can be enabled:

**Enable logging:**
```bash
export ARTIFACTS_DEBUG=1
# Or add to your shell profile (.zshrc, .bash_profile)
echo "export ARTIFACTS_DEBUG=1" >> ~/.zshrc
```

**View logs:**
```bash
tail -f /tmp/artifacts-categorize.log
```

**Disable logging:**
```bash
export ARTIFACTS_DEBUG=0
# Or remove from shell profile
```

The log shows detailed execution including environment, API calls, and responses.

### Common Issues

**Server not responding:**
```bash
# Check if server is running
lsof -i :4111

# Restart server
npm run dev
```

**Permissions errors:**
```bash
# Make script executable
chmod +x scripts/artifacts-categorize-file.sh
```

**Automator not triggering:**
- Ensure Folder Action is saved and enabled
- Check script paths are absolute
- Verify screenshot save location matches watched folder
- Enable debug logging to see what's happening

**Missing jq:**
```bash
# Install jq for JSON parsing
brew install jq
```

### Logs

Check Mastra server logs for debugging:
```bash
npm run dev
# Server logs will show processing details
```

Shell script logs in Console.app under "artifacts-categorize-file"

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with screenshots
5. Submit a pull request

## License

[Your License Here]

## Support

For issues and feature requests, please use the GitHub issues page.