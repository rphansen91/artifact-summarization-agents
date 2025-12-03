'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWeekDetails, WeekDetails, WeekFile } from '@/app/actions';

interface WeeklyDetailsViewProps {
  weekPath: string;
  weekName: string;
}

const ITEMS_PER_PAGE = 20;

export function WeeklyDetailsView({ weekPath, weekName }: WeeklyDetailsViewProps) {
  const [weekDetails, setWeekDetails] = useState<WeekDetails | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    async function loadWeekDetails() {
      console.log('Loading week details for path:', weekPath);
      setLoading(true);
      try {
        const details = await getWeekDetails(weekPath);
        console.log('Week details result:', details);
        setWeekDetails(details);
      } catch (error) {
        console.error('Failed to load week details:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadWeekDetails();
  }, [weekPath]);

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      // Extract relative path from full weekPath
      // weekPath format: /Users/ryanhansen/Documents/Artifacts/2025/Week_49_Dec01-Dec07
      // We want to send: 2025/Week_49_Dec01-Dec07
      const artifactsRoot = '/Users/ryanhansen/Documents/Artifacts';
      const relativePath = weekPath.replace(artifactsRoot, '').replace(/^\//, '');
      
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weekPath: relativePath }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      // Reload week details to show the new summary
      const details = await getWeekDetails(weekPath);
      setWeekDetails(details);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!weekDetails) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Week not found</h1>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300">
            ← Back to Artifacts
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(weekDetails.files.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFiles = weekDetails.files.slice(startIndex, endIndex);

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Artifacts
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{weekName}</h1>
        <p className="text-gray-400">
          {weekDetails.files.length} files · Last updated {formatRelativeTime(new Date(weekDetails.lastModified))}
        </p>
      </div>

      {/* Summary Section */}
      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">Week Summary</h3>
            <p className="text-gray-400 text-sm">
              {weekDetails.summaryFile 
                ? "View the generated summary for this week" 
                : "Generate an AI-powered summary of all artifacts in this week"}
            </p>
          </div>
          {weekDetails.summaryFile ? (
            <div className="flex items-center gap-2">
              <Link 
                href={`/file?path=${encodeURIComponent(weekDetails.summaryFile.path)}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View Summary
              </Link>
              <button
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generatingSummary ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Regenerating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generatingSummary ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Generate Summary
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Files List */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Files ({weekDetails.files.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-700">
          {currentFiles.map((file) => (
            <div key={file.path} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/file?path=${encodeURIComponent(file.path)}`}
                      className="text-white hover:text-indigo-400 font-medium truncate block"
                    >
                      {file.name}
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{formatRelativeTime(new Date(file.modifiedTime))}</span>
                      {file.category && (
                        <span className="px-2 py-0.5 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                          {file.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1}-{Math.min(endIndex, weekDetails.files.length)} of {weekDetails.files.length} files
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      page === currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}