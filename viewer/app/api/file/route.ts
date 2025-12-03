import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp', '.ico'];

const getContentType = (extension: string): string => {
  const ext = extension.toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.bmp': return 'image/bmp';
    case '.svg': return 'image/svg+xml';
    case '.webp': return 'image/webp';
    case '.ico': return 'image/x-icon';
    default: return 'text/plain; charset=utf-8';
  }
};

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

    const stats = fs.statSync(normalizedPath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: 'Path is not a file' }, { status: 400 });
    }

    const extension = path.extname(normalizedPath);
    const isImage = IMAGE_EXTENSIONS.includes(extension.toLowerCase());
    const contentType = getContentType(extension);

    if (isImage) {
      // For images, read as buffer and return binary data
      const content = fs.readFileSync(normalizedPath);
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } else {
      // For text files, read as UTF-8
      const content = fs.readFileSync(normalizedPath, 'utf-8');
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': contentType,
        },
      });
    }
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}