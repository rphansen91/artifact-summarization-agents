import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { metadataGenerationSchema } from '../agents/artifact-agent';
import { MessageListInput } from '@mastra/core/agent/message-list';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';

const artifactInputSchema = z.object({
  image_path: z.string().describe('Path or URL to the screenshot file'),
  notes: z.string().optional().describe('Optional freeform text describing the screenshot'),
  target_path: z.string().describe('Target directory path where files should be saved'),
  categories: z.array(z.string()).describe('Available categories for classification'),
});

const artifactOutputSchema = z.object({
  category: z.string(),
  filename: z.string(),
  title: z.string(), 
  markdown: z.string(),
  tags: z.array(z.string()),
  markdown_path: z.string().describe('Full path where markdown was saved'),
  image_path: z.string().describe('Full path where image was saved'),
});

const analyzeArtifact = createStep({
  id: 'analyze-artifact',
  description: 'Analyzes screenshot and generates complete metadata in one step',
  inputSchema: artifactInputSchema,
  outputSchema: artifactOutputSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const agent = mastra?.getAgent('artifactAgent');
    if (!agent) {
      throw new Error('Artifact analysis agent not found');
    }

    const categoriesList = inputData.categories.map(cat => `   - ${cat}`).join('\n');

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

    // Add image - load as buffer if local file, otherwise use path/URL
    if (inputData.image_path) {
      if (inputData.image_path.startsWith('/')) {
        // Local file - load as buffer
        const imageBuffer = await fs.readFile(inputData.image_path);
        messages.push({
          role: 'user',
          content: [{
            type: 'image',
            image: imageBuffer,
          }],
        });
      } else if (inputData.image_path.startsWith('http')) {
        // URL - use as string
        messages.push({
          role: 'user',
          content: [{
            type: 'image',
            image: inputData.image_path,
          }],
        });
      }
    }

    const response = await agent.generate(messages, {
      structuredOutput: {
        schema: metadataGenerationSchema,
      },
    });

    if (!response.object) {
      throw new Error('Failed to get structured metadata from agent');
    }

    const metadata = response.object;

    // Create target directory with category subdirectory
    const categoryPath = join(inputData.target_path, metadata.category);
    await fs.mkdir(categoryPath, { recursive: true });

    // Generate file paths within category directory
    const markdownPath = join(categoryPath, metadata.filename.replace('.png', '.md'));
    const imagePath = join(categoryPath, metadata.filename);

    // Write markdown file
    await fs.writeFile(markdownPath, metadata.markdown, 'utf8');

    // Copy image file with new name
    if (inputData.image_path.startsWith('/')) {
      await fs.copyFile(inputData.image_path, imagePath);
    } else {
      console.warn('Image path is not a local file, skipping image copy');
    }

    return {
      ...metadata,
      markdown_path: markdownPath,
      image_path: imagePath,
    };
  },
});

const artifactAnalysisWorkflow = createWorkflow({
  id: 'artifact-analysis-workflow',
  inputSchema: artifactInputSchema,
  outputSchema: artifactOutputSchema,
})
  .then(analyzeArtifact);

artifactAnalysisWorkflow.commit();

export { artifactAnalysisWorkflow };