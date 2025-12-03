'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Artifact {
  filename: string;
  filepath: string;
  type: string;
  summary: string;
  content: string;
  lastModified: string;
}

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  implementation_plan: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-300',
    border: 'border-blue-500/50',
  },
  walkthrough: {
    bg: 'bg-green-500/20',
    text: 'text-green-300',
    border: 'border-green-500/50',
  },
  task: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-300',
    border: 'border-purple-500/50',
  },
  other: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-300',
    border: 'border-gray-500/50',
  },
};

export default function ArtifactPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const filename = params.filename as string;
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtifact() {
      try {
        const response = await fetch(`/api/artifacts/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch artifact');
        }
        const artifacts: Artifact[] = await response.json();
        const found = artifacts.find(a => a.filename === filename);
        if (!found) {
          throw new Error('Artifact not found');
        }
        setArtifact(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchArtifact();
  }, [sessionId, filename]);

  const colors = artifact ? (typeColors[artifact.type] || typeColors.other) : typeColors.other;
  const displayName = filename.replace(/\.md$/, '');

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Sessions
        </Link>
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-300 font-mono">{sessionId}</span>
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white font-medium">{displayName}</span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm">Loading artifact...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <p className="font-medium">Error loading artifact</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      )}

      {/* Artifact Content */}
      {!loading && !error && artifact && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                {displayName}
              </h1>
              <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
                {artifact.summary}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border} uppercase tracking-wider`}>
                {artifact.type.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(artifact.lastModified).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="glass-card rounded-xl overflow-hidden border border-white/5 bg-[#0f0f16]">
            <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <div className="text-xs text-gray-500 font-mono">
                {filename}
              </div>
              <div className="w-12"></div> {/* Spacer for centering */}
            </div>
            <div className="p-8 overflow-x-auto">
              <MarkdownRenderer content={artifact.content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
