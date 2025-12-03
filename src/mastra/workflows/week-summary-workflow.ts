import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { promises as fs } from 'fs';
import { join } from 'path';
import { getCurrentWeekPath, getWeekCategories } from '../utils/week-utils';

const weekSummaryInputSchema = z.object({
  weekPath: z.string().optional().describe('Custom week path - if not provided, auto-detects current week'),
});

const weekSummaryOutputSchema = z.object({
  week_folder: z.string().describe('Current week folder name'),
  summary_path: z.string().describe('Path where summary.md was saved'),
  artifact_count: z.number().describe('Total number of artifacts processed'),
  categories_summary: z.record(z.string(), z.number()).describe('Count of artifacts per category'),
});

const generateWeekSummary = createStep({
  id: 'generate-week-summary',
  description: 'Generates a summary of all artifacts in the current week folder',
  inputSchema: weekSummaryInputSchema,
  outputSchema: weekSummaryOutputSchema,
  execute: async ({ mastra, inputData }) => {
    const agent = mastra?.getAgent('artifactAgent');
    if (!agent) {
      throw new Error('Artifact analysis agent not found');
    }

    // Get week path and categories - use provided path or auto-detect current week
    let weekPath: string;
    if (inputData?.weekPath) {
      // If weekPath is provided, combine it with the base path
      const basePath = process.env.TARGET_PATH || `${process.env.HOME}/Documents/Artifacts`;
      weekPath = join(basePath, inputData.weekPath);
    } else {
      // Auto-detect current week
      weekPath = getCurrentWeekPath();
    }
    const categories = await getWeekCategories(weekPath);
    const weekFolderName = weekPath.split('/').pop() || 'unknown-week';

    console.log(`Generating summary for: ${weekPath}`);

    // Check if summary already exists and backup if it does
    const summaryPath = join(weekPath, 'summary.md');
    try {
      await fs.access(summaryPath);
      // File exists, create backup with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = join(weekPath, `summary-${timestamp}.md`);
      await fs.copyFile(summaryPath, backupPath);
      console.log(`Existing summary backed up to: ${backupPath}`);
    } catch (error) {
      // File doesn't exist, no backup needed
      console.log('No existing summary found, creating new one');
    }

    // Scan all categories for artifacts
    const artifactsByCategory: Record<string, Array<{ title: string; filename: string; content: string }>> = {};
    let totalArtifacts = 0;

    for (const category of categories) {
      const categoryPath = join(weekPath, category);
      artifactsByCategory[category] = [];

      try {
        const files = await fs.readdir(categoryPath);
        const markdownFiles = files.filter(file => file.endsWith('.md'));

        for (const file of markdownFiles) {
          const filePath = join(categoryPath, file);
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const title = content.match(/^# (.+)$/m)?.[1] || file.replace('.md', '');
            
            artifactsByCategory[category].push({
              title,
              filename: file,
              content: content.substring(0, 500) // First 500 chars for summary
            });
            totalArtifacts++;
          } catch (error) {
            console.warn(`Failed to read ${filePath}:`, error);
          }
        }
      } catch (error) {
        console.warn(`Failed to scan category ${category}:`, error);
      }
    }

    // Create summary of artifacts for AI analysis
    const artifactsOverview = categories.map(category => {
      const artifacts = artifactsByCategory[category];
      if (artifacts.length === 0) return `**${category}**: No artifacts`;
      
      const artifactsList = artifacts.map(art => `- ${art.title}`).join('\n  ');
      return `**${category}** (${artifacts.length} artifacts):\n  ${artifactsList}`;
    }).join('\n\n');

    const detailedContent = categories.map(category => {
      const artifacts = artifactsByCategory[category];
      if (artifacts.length === 0) return '';
      
      const artifactDetails = artifacts.map(art => 
        `### ${art.title}\n${art.content.replace(/^# .+$/m, '').trim().substring(0, 300)}...`
      ).join('\n\n');
      
      return `## ${category}\n\n${artifactDetails}`;
    }).filter(Boolean).join('\n\n');

    // Generate AI summary using memory
    const prompt = `Generate a comprehensive weekly summary based on the artifacts collected this week.

Week: ${weekFolderName}
Total Artifacts: ${totalArtifacts}

## Artifacts Overview:
${artifactsOverview}

## Detailed Content:
${detailedContent}

Please create a structured weekly summary that includes:

1. **Executive Summary** - High-level overview of the week's activities and achievements
2. **Key Themes** - Main technical areas, projects, or focuses this week
3. **Notable Artifacts** - Highlight the most significant or interesting items
4. **Technical Insights** - Key learnings, patterns, or discoveries
5. **Categories Breakdown** - Brief summary of each category's contents
6. **Next Week Considerations** - Potential follow-ups or areas to explore

Focus on connecting related artifacts, identifying patterns, and providing insights that would be valuable for future reference. Use the memory context from previous interactions to maintain consistency and build upon earlier work.

Format as markdown with clear headings and structure.`;

    const response = await agent.generate([
      {
        role: 'user',
        content: prompt,
      },
    ], {
      memory: {
        resource: 'artifact-analysis',
        thread: weekPath
      }
    });

    if (!response.text) {
      throw new Error('Failed to generate summary from agent');
    }

    // Write summary to summary.md (path already defined above)
    const summaryContent = `${response.text}

---

## Artifact Statistics

${categories.map(cat => `- **${cat}**: ${artifactsByCategory[cat].length} artifacts`).join('\n')}

*This summary was automatically generated using AI analysis of all artifacts in this week's folder.*

*Generated on: ${new Date().toLocaleDateString()}*
*Total Artifacts: ${totalArtifacts}*`;

    await fs.writeFile(summaryPath, summaryContent, 'utf8');

    console.log(`Summary written to: ${summaryPath}`);

    // Create categories count object
    const categoriesSummary = categories.reduce((acc, cat) => {
      acc[cat] = artifactsByCategory[cat].length;
      return acc;
    }, {} as Record<string, number>);

    return {
      week_folder: weekFolderName,
      summary_path: summaryPath,
      artifact_count: totalArtifacts,
      categories_summary: categoriesSummary,
    };
  },
});

const weekSummaryWorkflow = createWorkflow({
  id: 'week-summary-workflow',
  inputSchema: weekSummaryInputSchema,
  outputSchema: weekSummaryOutputSchema,
})
  .then(generateWeekSummary);

weekSummaryWorkflow.commit();

export { weekSummaryWorkflow };