'use server';

import fs from 'fs';
import path from 'path';

export interface TreeItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeItem[];
}

const ARTIFACTS_ROOT = '/Users/ryanhansen/Documents/Artifacts';
const BRAIN_DIR = '/Users/ryanhansen/.gemini/antigravity/brain';

export async function getBrainArtifactsTree(): Promise<TreeItem[]> {
  return getArtifactsTreeFromDir(BRAIN_DIR);
}

export async function getArtifactsTree(): Promise<TreeItem[]> {
  // Combine both artifacts sources
  const [documentsArtifacts, brainArtifacts] = await Promise.all([
    getArtifactsTreeFromDir(ARTIFACTS_ROOT),
    getArtifactsTreeFromDir(BRAIN_DIR)
  ]);

  const combined: TreeItem[] = [];
  
  if (documentsArtifacts.length > 0) {
    combined.push({
      name: 'Documents Artifacts',
      path: ARTIFACTS_ROOT,
      type: 'directory',
      children: documentsArtifacts
    });
  }

  if (brainArtifacts.length > 0) {
    combined.push({
      name: 'Brain Artifacts',
      path: BRAIN_DIR,
      type: 'directory',
      children: brainArtifacts
    });
  }

  return combined;
}

export async function getArtifactsTreeFromDir(dirPath: string): Promise<TreeItem[]> {
  try {
    if (!fs.existsSync(dirPath)) {
      console.warn(`Directory not found: ${dirPath}`);
      return [];
    }

    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const items: TreeItem[] = [];
    const fileGroups: Map<string, string[]> = new Map();
    
    // First pass: collect directories and group files by basename
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue; // Exclude hidden files
      
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Handle directories normally
        const children = await getArtifactsTreeFromDir(fullPath);
        items.push({
          name: entry.name,
          path: fullPath,
          type: 'directory',
          children,
        });
      } else {
        // Group files by basename (filename without extension)
        const parsedPath = path.parse(entry.name);
        const baseName = parsedPath.name;
        
        if (!fileGroups.has(baseName)) {
          fileGroups.set(baseName, []);
        }
        fileGroups.get(baseName)!.push(fullPath);
      }
    }
    
    // Second pass: create file items from groups
    for (const [baseName, filePaths] of fileGroups) {
      if (filePaths.length === 1) {
        // Single file, use original name
        const originalName = path.basename(filePaths[0]);
        items.push({
          name: originalName,
          path: filePaths[0],
          type: 'file',
        });
      } else {
        // Multiple files with same basename, use basename as display name
        // Use the first file's path for routing (the API will handle finding all related files)
        items.push({
          name: baseName,
          path: filePaths[0], // Use first file as representative
          type: 'file',
        });
      }
    }

    // Sort: Directories first, then files, both alphabetically
    return items.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    });
  } catch (error) {
    console.error('Error reading artifacts tree:', error);
    return [];
  }
}
