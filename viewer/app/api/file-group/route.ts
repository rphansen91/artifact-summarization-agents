import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface FileData {
  path: string;
  content: string;
  extension: string;
  isImage: boolean;
}

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp', '.ico'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    // Security: Only allow access to files in the Documents/Artifacts directory
    const ARTIFACTS_ROOT = '/Users/ryanhansen/Documents/Artifacts';
    const normalizedPath = path.resolve(filePath);
    
    if (!normalizedPath.startsWith(ARTIFACTS_ROOT)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Get the base name without extension
    const parsedPath = path.parse(normalizedPath);
    const baseName = parsedPath.name;
    const directory = parsedPath.dir;

    // Find all files with the same base name but different extensions
    const files: FileData[] = [];

    if (fs.existsSync(directory)) {
      const dirEntries = fs.readdirSync(directory);
      
      for (const entry of dirEntries) {
        const entryPath = path.join(directory, entry);
        const entryParsed = path.parse(entryPath);
        
        // Check if this file has the same base name
        if (entryParsed.name === baseName && fs.statSync(entryPath).isFile()) {
          const extension = entryParsed.ext.toLowerCase();
          const isImage = IMAGE_EXTENSIONS.includes(extension);
          
          let content = '';
          if (!isImage) {
            try {
              content = fs.readFileSync(entryPath, 'utf-8');
            } catch (error) {
              // Skip files that can't be read as text
              console.warn(`Could not read file as text: ${entryPath}`);
              continue;
            }
          }
          
          files.push({
            path: entryPath,
            content,
            extension,
            isImage
          });
        }
      }
    }

    // Sort files: images first, then by extension
    files.sort((a, b) => {
      if (a.isImage && !b.isImage) return -1;
      if (!a.isImage && b.isImage) return 1;
      return a.extension.localeCompare(b.extension);
    });

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files found' }, { status: 404 });
    }

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error reading file group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}