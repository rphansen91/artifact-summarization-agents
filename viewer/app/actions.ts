'use server';

import fs from 'fs';
import path from 'path';

export interface TreeItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeItem[];
  fileCount?: number;
  extensions?: string[];
}

export interface WeekFile {
  name: string;
  path: string;
  size: number;
  modifiedTime: string;
  category?: string;
}

export interface WeekDetails {
  name: string;
  path: string;
  files: WeekFile[];
  summaryFile?: WeekFile;
  lastModified: string;
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
        
        // Count total files in this directory (including subdirectories)
        const fileCount = countFilesRecursively(children);
        
        // Check if this is a leaf directory (contains only files, no subdirectories)
        const isLeafDirectory = children.every(child => child.type === 'file');
        
        items.push({
          name: entry.name,
          path: fullPath,
          type: 'directory',
          children,
          fileCount: isLeafDirectory ? fileCount : undefined,
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
        // Multiple files with same basename, collect extensions
        const extensions = filePaths
          .map(filePath => path.extname(filePath))
          .filter(ext => ext) // Remove empty extensions
          .map(ext => ext.toLowerCase())
          .filter((ext, index, arr) => arr.indexOf(ext) === index) // Remove duplicates
          .sort();
        
        items.push({
          name: baseName,
          path: filePaths[0], // Use first file as representative
          type: 'file',
          extensions,
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

export async function getWeekDetails(weekPath: string): Promise<WeekDetails | null> {
  try {
    if (!fs.existsSync(weekPath) || !fs.statSync(weekPath).isDirectory()) {
      return null;
    }

    const entries = await fs.promises.readdir(weekPath, { withFileTypes: true });
    const files: WeekFile[] = [];
    let summaryFile: WeekFile | undefined;
    let lastModified = new Date(0);

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const fullPath = path.join(weekPath, entry.name);
      
      if (entry.isFile()) {
        const stat = await fs.promises.stat(fullPath);
        const file: WeekFile = {
          name: entry.name,
          path: fullPath,
          size: stat.size,
          modifiedTime: stat.mtime.toISOString(),
        };

        // Detect category from file name or path
        if (entry.name.includes('-Code') || entry.name.includes('1-Code')) {
          file.category = 'Code';
        } else if (entry.name.includes('-Terminal') || entry.name.includes('2-Terminal')) {
          file.category = 'Terminal';
        } else if (entry.name.includes('-Performance') || entry.name.includes('3-Performance')) {
          file.category = 'Performance';
        } else if (entry.name.includes('-Architecture') || entry.name.includes('4-Architecture')) {
          file.category = 'Architecture';
        } else if (entry.name.includes('-AI_Agents') || entry.name.includes('5-AI_Agents')) {
          file.category = 'AI Agents';
        } else if (entry.name.includes('-Product') || entry.name.includes('6-Product')) {
          file.category = 'Product';
        } else if (entry.name.includes('-Client_Work') || entry.name.includes('7-Client_Work')) {
          file.category = 'Client Work';
        } else if (entry.name.includes('-Random') || entry.name.includes('8-Random')) {
          file.category = 'Random';
        }

        // Check if this is a summary file
        if (entry.name.toLowerCase().includes('summary')) {
          summaryFile = file;
        } else {
          files.push(file);
        }

        // Update last modified time
        if (stat.mtime > lastModified) {
          lastModified = stat.mtime;
        }
      } else if (entry.isDirectory()) {
        // Handle subdirectories (e.g., numbered categories)
        const subFiles = await getFilesFromDirectory(fullPath, entry.name);
        files.push(...subFiles);
        
        // Update last modified time from subdirectory
        const subdirStat = await fs.promises.stat(fullPath);
        if (subdirStat.mtime > lastModified) {
          lastModified = subdirStat.mtime;
        }
      }
    }

    // Sort files by modification time (newest first)
    files.sort((a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime());

    return {
      name: path.basename(weekPath),
      path: weekPath,
      files,
      summaryFile,
      lastModified: lastModified.toISOString(),
    };
  } catch (error) {
    console.error('Error getting week details:', error);
    return null;
  }
}

async function getFilesFromDirectory(dirPath: string, categoryName: string): Promise<WeekFile[]> {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const files: WeekFile[] = [];

    for (const entry of entries) {
      if (entry.name.startsWith('.') || !entry.isFile()) continue;

      const fullPath = path.join(dirPath, entry.name);
      const stat = await fs.promises.stat(fullPath);

      files.push({
        name: entry.name,
        path: fullPath,
        size: stat.size,
        modifiedTime: stat.mtime.toISOString(),
        category: categoryName,
      });
    }

    return files;
  } catch (error) {
    console.error('Error reading directory files:', error);
    return [];
  }
}

function countFilesRecursively(items: TreeItem[]): number {
  let count = 0;
  for (const item of items) {
    if (item.type === 'file') {
      count++;
    } else if (item.type === 'directory' && item.children) {
      count += countFilesRecursively(item.children);
    }
  }
  return count;
}

export async function getMostRecentWeekPath(): Promise<string | null> {
  try {
    const entries = await fs.promises.readdir(ARTIFACTS_ROOT, { withFileTypes: true });
    const years: string[] = [];
    
    // Find year directories
    for (const entry of entries) {
      if (entry.isDirectory() && /^\d{4}$/.test(entry.name)) {
        years.push(entry.name);
      }
    }
    
    if (years.length === 0) return null;
    
    // Sort years in descending order (most recent first)
    years.sort((a, b) => parseInt(b) - parseInt(a));
    
    // Look through each year for the most recent week
    for (const year of years) {
      const yearPath = path.join(ARTIFACTS_ROOT, year);
      const yearEntries = await fs.promises.readdir(yearPath, { withFileTypes: true });
      const weeks: { name: string; mtime: Date }[] = [];
      
      for (const entry of yearEntries) {
        if (entry.isDirectory() && entry.name.includes('Week_')) {
          const weekPath = path.join(yearPath, entry.name);
          const stat = await fs.promises.stat(weekPath);
          weeks.push({ name: entry.name, mtime: stat.mtime });
        }
      }
      
      if (weeks.length > 0) {
        // Sort weeks by modification time (most recent first)
        weeks.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
        return path.join(yearPath, weeks[0].name);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding most recent week:', error);
    return null;
  }
}
