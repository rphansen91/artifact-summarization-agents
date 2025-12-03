'use client';

import React, { useState, useEffect } from 'react';
import { TreeItem } from '@/app/actions';

interface ArtifactDetailsProps {
  selectedItem: TreeItem | null;
}

export function ArtifactDetails({ selectedItem }: ArtifactDetailsProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedItem || selectedItem.type === 'directory') {
      setContent('');
      setError(null);
      return;
    }

    const loadFileContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/file-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: selectedItem.path })
        });

        if (!response.ok) {
          throw new Error('Failed to load file content');
        }

        const data = await response.json();
        setContent(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadFileContent();
  }, [selectedItem]);

  if (!selectedItem) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Select an artifact to view details</p>
        </div>
      </div>
    );
  }

  if (selectedItem.type === 'directory') {
    const childCount = selectedItem.children?.length || 0;
    const fileCount = selectedItem.children?.filter(child => child.type === 'file').length || 0;
    const dirCount = selectedItem.children?.filter(child => child.type === 'directory').length || 0;

    return (
      <div className="flex-1 p-6">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
            <div>
              <h2 className="text-xl font-semibold text-white">{selectedItem.name}</h2>
              <p className="text-gray-400 text-sm">Directory</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Path</h3>
              <p className="text-gray-400 bg-gray-800 p-2 rounded font-mono text-sm">{selectedItem.path}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Contents</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-white">{childCount}</div>
                  <div className="text-xs text-gray-400">Total Items</div>
                </div>
                <div className="bg-gray-800 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-blue-400">{dirCount}</div>
                  <div className="text-xs text-gray-400">Directories</div>
                </div>
                <div className="bg-gray-800 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-green-400">{fileCount}</div>
                  <div className="text-xs text-gray-400">Files</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <h2 className="text-lg font-semibold text-white">{selectedItem.name}</h2>
            <p className="text-gray-400 text-sm font-mono">{selectedItem.path}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p>Error loading file: {error}</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <pre className="p-6 text-sm text-gray-300 font-mono whitespace-pre-wrap">
              {content || 'File appears to be empty'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}