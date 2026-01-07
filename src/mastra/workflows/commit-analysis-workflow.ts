import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { promises as fs } from 'fs';
import { join } from 'path';
import { getCurrentWeekPath } from '../utils/week-utils';

const commitAnalysisInputSchema = z.object({
  image_path: z.null(),
  type: z.literal('git_commit'),
  repo: z.string().describe('Repository name'),
  commit_hash: z.string().describe('Git commit hash'),
  message: z.string().describe('Commit message'),
  changed_files: z.string().describe('List of changed files'),
  diff: z.string().describe('Git diff output'),
  remote_url: z.string().optional().describe('Git remote URL'),
});

const commitAnalysisOutputSchema = z.object({
  category: z.string(),
  filename: z.string(),
  title: z.string(), 
  markdown: z.string(),
  tags: z.array(z.string()),
  markdown_path: z.string().describe('Full path where markdown was saved'),
  week_folder: z.string().describe('Current week folder name'),
  commit_hash: z.string().describe('Git commit hash'),
  repo: z.string().describe('Repository name'),
});

const analyzeCommit = createStep({
  id: 'analyze-commit',
  description: 'Analyzes Git commit and generates documentation artifact',
  inputSchema: commitAnalysisInputSchema,
  outputSchema: commitAnalysisOutputSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('artifactAgent');
    if (!agent) {
      throw new Error('Artifact analysis agent not found');
    }

    // Auto-detect current week path
    const currentWeekPath = getCurrentWeekPath();
    // Extract year and week folder to match chat view resourceId format (e.g., "2025-Week_52_Dec22-Dec28")
    const pathParts = currentWeekPath.split('/');
    const weekFolderName = `${pathParts[pathParts.length - 2]}-${pathParts[pathParts.length - 1]}`;

    console.log(`Analyzing commit ${inputData.commit_hash} from ${inputData.repo}`);

    // Parse changed files for better readability
    const filesList = inputData.changed_files.split('\n').filter(Boolean);
    const filesCount = filesList.length;

    const prompt = `Analyze this Git commit and generate structured documentation for the artifact system.

**Repository**: ${inputData.repo}
**Commit**: ${inputData.commit_hash.substring(0, 8)}
**Message**: ${inputData.message}
**Files Changed** (${filesCount}):
${filesList.map(f => `  - ${f}`).join('\n')}

**Diff**:
\`\`\`
${inputData.diff.substring(0, 2000)}${inputData.diff.length > 2000 ? '\n... (truncated)' : ''}
\`\`\`

Analyze this commit and provide:

1. **Category Classification** - Choose the best fitting category:
   - 1-Code: New features, bug fixes, refactoring, implementation changes
   - 2-Terminal: Scripts, CLI tools, configuration files
   - 3-Performance: Optimizations, benchmarks, performance improvements
   - 4-Architecture: Structural changes, design patterns, system architecture
   - 5-AI_Agents: AI/ML code, agent implementations, AI workflows
   - 6-Product: UI/UX changes, product features, user-facing improvements
   - 7-Client_Work: Client-specific implementations, project deliverables
   - 8-Random: Documentation, minor fixes, miscellaneous changes

2. **File Naming** - Generate a descriptive slug (max 60 chars, lowercase, hyphens only) with .md extension

3. **Title** - Create a clear, concise title describing the commit's purpose

4. **Markdown Summary** - Write a 150-250 word summary with:
   - Clear title with # heading
   - Description of what the commit accomplishes
   - Technical details and changes made
   - Impact and significance of the changes
   - Connection to broader project goals if apparent

5. **Tags** - Generate 5-8 searchable tags (lowercase, hyphen-separated) focusing on:
   - Technologies involved
   - Type of change (feature, bugfix, refactor, etc.)
   - Areas of the codebase affected
   - Programming languages or frameworks

Focus on technical accuracy and provide insights that would be valuable for project documentation and future reference.`;

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ], {
      structuredOutput: {
        schema: z.object({
          category: z.string(),
          filename: z.string(),
          title: z.string(),
          markdown: z.string(),
          tags: z.array(z.string()),
        }),
      },
      memory: {
        resource: `week-${weekFolderName}`,
        thread: `main-${weekFolderName}`
      }
    });

    if (!response.object) {
      throw new Error('Failed to get structured analysis from agent');
    }

    const metadata = response.object;

    // Generate timestamp-prefixed filename to ensure uniqueness
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); // YYYY-MM-DDTHH-MM-SS
    
    // Ensure filename ends with .md
    const baseFilename = metadata.filename.endsWith('.md') ? metadata.filename : `${metadata.filename}.md`;
    const timestampedFilename = `${timestamp}_${baseFilename}`;

    // Create category subdirectory within current week
    const categoryPath = join(currentWeekPath, metadata.category);
    await fs.mkdir(categoryPath, { recursive: true });

    // Generate file path within category directory
    const markdownPath = join(categoryPath, timestampedFilename);

    // Generate commit link if remote URL is available
    let commitLink = `\`${inputData.commit_hash}\``;
    if (inputData.remote_url) {
      const remoteUrl = inputData.remote_url;
      if (remoteUrl.includes('github.com')) {
        // GitHub format
        const repoPath = remoteUrl.replace(/\.git$/, '').replace(/^.*github\.com[\/:]/, '');
        commitLink = `[\`${inputData.commit_hash.substring(0, 8)}\`](https://github.com/${repoPath}/commit/${inputData.commit_hash})`;
      } else if (remoteUrl.includes('gitlab.com')) {
        // GitLab format  
        const repoPath = remoteUrl.replace(/\.git$/, '').replace(/^.*gitlab\.com[\/:]/, '');
        commitLink = `[\`${inputData.commit_hash.substring(0, 8)}\`](https://gitlab.com/${repoPath}/-/commit/${inputData.commit_hash})`;
      } else {
        // Generic format - just show the hash
        commitLink = `\`${inputData.commit_hash.substring(0, 8)}\``;
      }
    }

    // Enhance markdown with commit metadata
    const enhancedMarkdown = `${metadata.markdown}

---

## Commit Details

- **Repository**: ${inputData.repo}
- **Commit**: ${commitLink}
- **Files Changed**: ${filesCount}
- **Timestamp**: ${new Date().toISOString()}
${inputData.remote_url ? `- **Remote**: ${inputData.remote_url}` : ''}

### Changed Files
${filesList.map(f => `- \`${f}\``).join('\n')}

### Tags
${metadata.tags.map(tag => `\`${tag}\``).join(' ')}

*This artifact was automatically generated from a Git commit.*`;

    // Write markdown file
    await fs.writeFile(markdownPath, enhancedMarkdown, 'utf8');

    console.log(`Commit analysis saved to: ${markdownPath}`);

    return {
      category: metadata.category,
      filename: timestampedFilename,
      title: metadata.title,
      markdown: enhancedMarkdown,
      tags: metadata.tags,
      markdown_path: markdownPath,
      week_folder: weekFolderName,
      commit_hash: inputData.commit_hash,
      repo: inputData.repo,
    };
  },
});

const commitAnalysisWorkflow = createWorkflow({
  id: 'commit-analysis-workflow',
  inputSchema: commitAnalysisInputSchema,
  outputSchema: commitAnalysisOutputSchema,
})
  .then(analyzeCommit);

commitAnalysisWorkflow.commit();

export { commitAnalysisWorkflow };