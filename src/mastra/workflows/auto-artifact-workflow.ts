import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { metadataGenerationSchema } from '../agents/artifact-agent';
import { MessageListInput } from '@mastra/core/agent/message-list';
import { promises as fs } from 'fs';
import { join } from 'path';
import { getCurrentWeekCategories, getCurrentWeekPath, ensureCurrentWeekStructure } from '../utils/week-utils';

const autoArtifactInputSchema = z.object({
  image_path: z.string().describe('Path to the screenshot file'),
  notes: z.string().optional().describe('Optional freeform text describing the screenshot'),
});

const autoArtifactOutputSchema = z.object({
  category: z.string(),
  filename: z.string(),
  title: z.string(), 
  markdown: z.string(),
  tags: z.array(z.string()),
  markdown_path: z.string().describe('Full path where markdown was saved'),
  image_path: z.string().describe('Full path where image was saved'),
  week_folder: z.string().describe('Current week folder name'),
});

const autoAnalyzeArtifact = createStep({
  id: 'auto-analyze-artifact',
  description: 'Analyzes screenshot with auto-detected categories and target path from current week',
  inputSchema: autoArtifactInputSchema,
  outputSchema: autoArtifactOutputSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('artifactAgent');
    if (!agent) {
      throw new Error('Artifact analysis agent not found');
    }

    // Auto-detect current week path and categories
    const currentWeekPath = getCurrentWeekPath();
    const categories = await getCurrentWeekCategories();
    
    // Ensure week structure exists
    await ensureCurrentWeekStructure();

    console.log(`Auto-detected week path: ${currentWeekPath}`);
    console.log(`Auto-detected categories: ${categories.join(', ')}`);

    const categoriesList = categories.map(cat => `   - ${cat}`).join('\n');

    const prompt = `Analyze this screenshot and generate complete structured metadata for artifact organization.

Image Path: ${inputData.image_path}
User Notes: ${inputData.notes || 'No additional notes provided'}

Analyze the screenshot and provide:

1. **Category Classification** - Choose the best fitting category from the available options:
${categoriesList}

2. **File Naming** - Generate a descriptive slug (max 60 chars, lowercase, hyphens only) with .png extension

3. **Title** - Create a clear, concise title describing the content

4. **Markdown Summary** - Write a 100-200 word summary with:
   - Clear title with # heading
   - Description of what the screenshot shows
   - Technical details and significance
   - Why this artifact matters
   - Connection to existing work if applicable

5. **Tags** - Generate 5-8 searchable tags (lowercase, hyphen-separated) focusing on:
   - Technologies visible
   - Concepts demonstrated
   - Tools and frameworks
   - Technical categories

Focus on technical accuracy and provide specific, actionable insights about what's shown in the image.`;

    const messages: MessageListInput = [
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    // Add image
    messages.push({
      role: 'user',
      content: [{
        type: 'image',
        image: inputData.image_path,
      }],
    });

    const response = await agent.generate(messages, {
      structuredOutput: {
        schema: metadataGenerationSchema,
      },
    });

    if (!response.object) {
      throw new Error('Failed to get structured metadata from agent');
    }

    const metadata = response.object;

    // Create category subdirectory within current week
    const categoryPath = join(currentWeekPath, metadata.category);
    await fs.mkdir(categoryPath, { recursive: true });

    // Generate file paths within category directory
    const markdownPath = join(categoryPath, metadata.filename.replace('.png', '.md'));
    const imagePath = join(categoryPath, metadata.filename);

    // Write markdown file
    await fs.writeFile(markdownPath, metadata.markdown, 'utf8');

    // Copy image file with new name
    await fs.copyFile(inputData.image_path, imagePath);

    // Extract week folder name from path
    const weekFolderName = currentWeekPath.split('/').pop() || 'unknown-week';

    return {
      ...metadata,
      markdown_path: markdownPath,
      image_path: imagePath,
      week_folder: weekFolderName,
    };
  },
});

const autoArtifactAnalysisWorkflow = createWorkflow({
  id: 'auto-artifact-analysis-workflow',
  inputSchema: autoArtifactInputSchema,
  outputSchema: autoArtifactOutputSchema,
})
  .then(autoAnalyzeArtifact);

autoArtifactAnalysisWorkflow.commit();

export { autoArtifactAnalysisWorkflow };