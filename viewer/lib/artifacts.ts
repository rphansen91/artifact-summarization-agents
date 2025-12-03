import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BRAIN_DIR = '/Users/ryanhansen/.gemini/antigravity/brain';

export interface ArtifactMetadata {
  ArtifactType: 'implementation_plan' | 'walkthrough' | 'task' | 'other';
  Summary: string;
}

export interface Artifact {
  filename: string;
  filepath: string;
  type: string;
  summary: string;
  content: string;
  lastModified: Date;
}

export interface Session {
  id: string;
  path: string;
  artifactCount: number;
  lastModified: Date;
}

/**
 * Get all session directories from the brain folder
 */
export async function getSessionDirectories(): Promise<Session[]> {
  try {
    if (!fs.existsSync(BRAIN_DIR)) {
      return [];
    }

    const entries = fs.readdirSync(BRAIN_DIR, { withFileTypes: true });
    const sessions: Session[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const sessionPath = path.join(BRAIN_DIR, entry.name);
        const files = fs.readdirSync(sessionPath);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        
        // Get the most recent modification time
        let lastModified = new Date(0);
        for (const file of mdFiles) {
          const filePath = path.join(sessionPath, file);
          const stats = fs.statSync(filePath);
          if (stats.mtime > lastModified) {
            lastModified = stats.mtime;
          }
        }

        sessions.push({
          id: entry.name,
          path: sessionPath,
          artifactCount: mdFiles.length,
          lastModified,
        });
      }
    }

    // Sort by last modified, most recent first
    return sessions.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  } catch (error) {
    console.error('Error reading session directories:', error);
    return [];
  }
}

/**
 * Get all artifacts for a specific session
 */
export async function getArtifactsForSession(sessionId: string): Promise<Artifact[]> {
  try {
    const sessionPath = path.join(BRAIN_DIR, sessionId);
    
    if (!fs.existsSync(sessionPath)) {
      return [];
    }

    const files = fs.readdirSync(sessionPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    const artifacts: Artifact[] = [];

    for (const filename of mdFiles) {
      const filepath = path.join(sessionPath, filename);
      const artifact = await parseMarkdownFile(filepath, filename);
      if (artifact) {
        artifacts.push(artifact);
      }
    }

    // Sort by last modified, most recent first
    return artifacts.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  } catch (error) {
    console.error('Error reading artifacts for session:', error);
    return [];
  }
}

/**
 * Parse a markdown file and extract metadata
 */
export async function parseMarkdownFile(filepath: string, filename: string): Promise<Artifact | null> {
  try {
    const fileContent = fs.readFileSync(filepath, 'utf-8');
    const stats = fs.statSync(filepath);
    
    // Try to parse frontmatter
    let metadata: Partial<ArtifactMetadata> = {};
    let content = fileContent;
    
    try {
      const parsed = matter(fileContent);
      metadata = parsed.data as Partial<ArtifactMetadata>;
      content = parsed.content;
    } catch {
      // If no frontmatter, use the whole content
      content = fileContent;
    }

    return {
      filename,
      filepath,
      type: metadata.ArtifactType || 'other',
      summary: metadata.Summary || 'No summary available',
      content,
      lastModified: stats.mtime,
    };
  } catch (error) {
    console.error('Error parsing markdown file:', error);
    return null;
  }
}

/**
 * Get a single artifact by session ID and filename
 */
export async function getArtifact(sessionId: string, filename: string): Promise<Artifact | null> {
  try {
    const filepath = path.join(BRAIN_DIR, sessionId, filename);
    
    if (!fs.existsSync(filepath)) {
      return null;
    }

    return await parseMarkdownFile(filepath, filename);
  } catch (error) {
    console.error('Error getting artifact:', error);
    return null;
  }
}
