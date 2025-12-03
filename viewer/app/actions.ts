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

export async function getArtifactsTree(dirPath: string = ARTIFACTS_ROOT): Promise<TreeItem[]> {
  try {
    if (!fs.existsSync(dirPath)) {
      console.warn(`Directory not found: ${dirPath}`);
      return [];
    }

    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    const items: TreeItem[] = await Promise.all(
      entries
        .filter(entry => !entry.name.startsWith('.')) // Exclude hidden files
        .map(async (entry) => {
          const fullPath = path.join(dirPath, entry.name);
          const isDirectory = entry.isDirectory();
          
          let children: TreeItem[] | undefined;
          if (isDirectory) {
            // Recursively get children
            children = await getArtifactsTree(fullPath);
          }

          return {
            name: entry.name,
            path: fullPath,
            type: isDirectory ? 'directory' : 'file',
            children,
          };
        })
    );

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
