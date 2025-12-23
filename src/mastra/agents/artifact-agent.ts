import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { z } from 'zod';

export const artifactAgent = new Agent({
  name: 'Artifact Analysis Agent',
  instructions: `
    You are a technical artifact analysis specialist that analyzes screenshots and images to extract structured metadata for documentation and organization purposes.

    Your primary functions are:
    1. Analyze screenshots and technical images to identify key technical elements
    2. Categorize content based on technical domain (Code, Terminal, Performance, Architecture, etc.)
    3. Generate descriptive metadata including titles, summaries, and searchable tags
    4. Create file-safe naming conventions for organization

    When analyzing images:
    - Focus on technical details: frameworks, languages, tools, interfaces, systems
    - Identify specific technologies and patterns visible
    - Consider the technical context and purpose
    - Generate concise but informative descriptions
    - Create lowercase, hyphen-separated tags for searchability
    - Keep summaries between 100-200 words
    - Generate file-safe slugs (lowercase, hyphens only, max 60 chars)

    Categories available:
    - 1-Code: Source code, IDEs, programming interfaces, development tools
    - 2-Terminal: Command line interfaces, shell sessions, CLI tools, console output
    - 3-Performance: Metrics, monitoring, profiling, benchmarks, analytics dashboards
    - 4-Architecture: System diagrams, infrastructure, database schemas, technical designs
    - 5-AI_Agents: AI tools, LLM interfaces, agent frameworks, AI development
    - 6-Product: UI/UX, product features, user interfaces, design systems
    - 7-Client_Work: Client-specific work, project deliverables, business applications
    - 8-Random: Miscellaneous technical content that doesn't fit other categories

    Always provide structured, consistent output that can be used for automated processing.
  `,
  model: 'openai/gpt-4o',
  memory: new Memory({
    storage: new LibSQLStore({
      url: process.env.MASTRA_DB_PATH || 'file:../mastra.db',
    }),
  }),
});

export const VALID_CATEGORIES = [
  '1-Code',
  '2-Terminal', 
  '3-Performance',
  '4-Architecture',
  '5-AI_Agents',
  '6-Product',
  '7-Client_Work',
  '8-Random'
] as const;

export const screenshotAnalysisSchema = z.object({
  analysis: z.string().describe('Detailed technical analysis of the screenshot content'),
  suggested_category: z.enum(VALID_CATEGORIES).describe('Best fitting category for this content'),
  key_elements: z.array(z.string()).describe('List of specific technologies, frameworks, or patterns identified'),
  technical_details: z.array(z.string()).describe('Important technical details visible in the screenshot'),
});

export const metadataGenerationSchema = z.object({
  category: z.enum(VALID_CATEGORIES).describe('Final category classification'),
  filename: z.string().max(60).describe('File-safe slug with .png extension'),
  title: z.string().max(100).describe('Clear, concise title describing the content'),
  markdown: z.string().describe('Markdown-formatted summary (100-200 words)'),
  tags: z.array(z.string()).describe('Lowercase, hyphen-separated tags for searchability'),
});