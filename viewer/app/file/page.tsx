'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface FileData {
  path: string;
  content: string;
  extension: string;
  isImage: boolean;
}

export default function FilePage() {
  const searchParams = useSearchParams();
  const filePath = searchParams.get('path');
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath) {
      setError('No file path provided');
      setLoading(false);
      return;
    }

    async function fetchFiles() {
      try {
        const response = await fetch(`/api/file-group?path=${encodeURIComponent(filePath)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        const data = await response.json();
        setFiles(data.files);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, [filePath]);

  const fileName = filePath ? filePath.split('/').pop() || 'Unknown File' : 'Unknown File';
  const baseName = fileName.replace(/\.[^/.]+$/, ''); // Remove extension for display

  const renderFileContent = (file: FileData) => {
    if (file.isImage) {
      return (
        <div className="flex justify-center">
          <img 
            src={`/api/file?path=${encodeURIComponent(file.path)}`}
            alt={file.path.split('/').pop() || 'Image'}
            className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
          />
        </div>
      );
    } else if (file.extension === '.md') {
      return (
        <div className="prose prose-invert max-w-none">
          <MarkdownRenderer content={file.content} />
        </div>
      );
    } else {
      return (
        <div className="max-h-96 overflow-y-auto">
          <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {file.content}
          </pre>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Documents
        </Link>
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white font-medium">{baseName}</span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm">Loading files...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <p className="font-medium">Error loading files</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      )}

      {/* Files Content */}
      {!loading && !error && files.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                {baseName}
              </h1>
              <p className="text-gray-400 text-sm">
                {files.length > 1 ? `${files.length} related files` : 'Single file'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <span key={index} className="px-2 py-1 rounded bg-gray-700/50 text-xs text-gray-300 font-mono">
                  {file.extension}
                </span>
              ))}
            </div>
          </div>

          {/* Content - Responsive Grid */}
          <div className={`grid gap-6 ${files.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {files.map((file, index) => {
              const fileDisplayName = file.path.split('/').pop() || 'Unknown File';
              return (
                <div key={index} className="glass-card rounded-xl overflow-hidden border border-white/5 bg-[#0f0f16]">
                  <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {fileDisplayName}
                    </div>
                    <div className="w-12"></div> {/* Spacer for centering */}
                  </div>
                  <div className="p-4 lg:p-6 overflow-x-auto">
                    {renderFileContent(file)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}