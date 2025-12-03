import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Security check - ensure file path is within artifacts directory
    const ARTIFACTS_ROOT = '/Users/ryanhansen/Documents/Artifacts';
    if (!filePath.startsWith(ARTIFACTS_ROOT)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const stats = await fs.promises.stat(filePath);
    if (stats.isDirectory()) {
      return NextResponse.json(
        { error: 'Cannot read directory as file' },
        { status: 400 }
      );
    }

    // Read file content with size limit (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (stats.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large to display' },
        { status: 413 }
      );
    }

    const content = await fs.promises.readFile(filePath, 'utf-8');

    return NextResponse.json({
      content,
      size: stats.size,
      lastModified: stats.mtime.toISOString()
    });

  } catch (error) {
    console.error('Error reading file:', error);
    
    if (error instanceof Error && error.message.includes('ENOENT')) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes('binary')) {
      return NextResponse.json(
        { error: 'Cannot display binary file' },
        { status: 415 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}