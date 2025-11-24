import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { metadataGenerationSchema } from '../agents/artifact-agent';
import { MessageListInput } from '@mastra/core/agent/message-list';
import { promises as fs } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getCurrentWeekCategories, getCurrentWeekPath, ensureCurrentWeekStructure } from '../utils/week-utils';

const execAsync = promisify(exec);

const autoArtifactInputSchema = z.object({
  image_path: z.string().describe('Path or URL to the screenshot file'),
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

    const prompt = `Analyze this screenshot and generate complete structured metadata for artifact organization.

Image Path: ${inputData.image_path}
User Notes: ${inputData.notes || 'No additional notes provided'}

Analyze the screenshot and provide:

1. **Category Classification** - Choose the best fitting category from the available options:
  - 1-Code: Source code, IDEs, programming interfaces, development tools
  - 2-Terminal: Command line interfaces, shell sessions, CLI tools, console output
  - 3-Performance: Metrics, monitoring, profiling, benchmarks, analytics dashboards
  - 4-Architecture: System diagrams, infrastructure, database schemas, technical designs
  - 5-AI_Agents: AI tools, LLM interfaces, agent frameworks, AI development
  - 6-Product: UI/UX, product features, user interfaces, design systems
  - 7-Client_Work: Client-specific work, project deliverables, business applications
  - 8-Random: Miscellaneous technical content that doesn't fit other categories

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
        // Map local paths to container paths
        let containerPath = inputData.image_path;
        const desktopPath = process.env.DESKTOP_PATH || '/Users/ryanhansen/Desktop/';
        const containerDesktopPath = process.env.CONTAINER_DESKTOP_PATH || '/app/desktop/';
        
        if (inputData.image_path.startsWith(desktopPath)) {
          containerPath = inputData.image_path.replace(desktopPath, containerDesktopPath);
        }
        
        console.log(`Loading image from local file: ${inputData.image_path} -> ${containerPath}`);
        // Local file - load as buffer
        const imageBuffer = await fs.readFile(containerPath);
        messages.push({
          role: 'user',
          content: [{
            type: 'file',
            data: imageBuffer,
            mediaType: 'image/png',
          }],
        });
      } else {
        // URL or other - use as string
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
      memory: {
        resource: 'artifact-analysis',
        thread: currentWeekPath
      }
    });

    if (!response.object) {
      throw new Error('Failed to get structured metadata from agent');
    }

    const metadata = response.object;

    // Create category subdirectory within current week
    const categoryPath = join(currentWeekPath, metadata.category);
    await fs.mkdir(categoryPath, { recursive: true });

    // Generate timestamp-prefixed filename to ensure uniqueness
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); // YYYY-MM-DDTHH-MM-SS
    const timestampedFilename = `${timestamp}_${metadata.filename}`;

    // Generate file paths within category directory
    const markdownPath = join(categoryPath, timestampedFilename.replace('.png', '.md'));
    const imagePath = join(categoryPath, timestampedFilename);

    // Write markdown file
    await fs.writeFile(markdownPath, metadata.markdown, 'utf8');

    console.log(`Artifact analysis saved to: ${markdownPath}`);

    // Copy image file with new name
    if (inputData.image_path.startsWith('/')) {
      // Map local paths to container paths for copying
      let sourceContainerPath = inputData.image_path;
      const desktopPath = process.env.DESKTOP_PATH || '/Users/ryanhansen/Desktop/';
      const containerDesktopPath = process.env.CONTAINER_DESKTOP_PATH || '/app/desktop/';
      
      if (inputData.image_path.startsWith(desktopPath)) {
        sourceContainerPath = inputData.image_path.replace(desktopPath, containerDesktopPath);
      }
      
      await fs.copyFile(sourceContainerPath, imagePath);
    } else {
      console.warn('Image path is not a local file, skipping image copy');
    }

    // Extract week folder name from path
    const weekFolderName = currentWeekPath.split('/').pop() || 'unknown-week';

    // Show Mac notification (non-intrusive)
    try {
      const notificationMessage = `Category: ${metadata.category} • Saved to: ${weekFolderName}`;
      
      // Show a proper Mac notification
      const appleScript = `display notification "${notificationMessage}" with title "${metadata.title}" subtitle "Screenshot Categorized"`;
      
      // Run the notification
      execAsync(`osascript -e '${appleScript}'`).catch(console.warn);
      
      // Also automatically open the category folder after a short delay
      // setTimeout(() => {
      //   execAsync(`open "${markdownPath}"`).catch(console.warn);
      // }, 1000);
      
    } catch (error) {
      console.warn('Failed to show notification:', error);
    }

    return {
      ...metadata,
      filename: timestampedFilename,
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