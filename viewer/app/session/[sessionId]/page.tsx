'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ArtifactCard from '@/components/ArtifactCard';

interface Artifact {
  filename: string;
  filepath: string;
  type: string;
  summary: string;
  content: string;
  lastModified: string;
}

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtifacts() {
      try {
        const response = await fetch(`/api/artifacts/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch artifacts');
        }
        const data = await response.json();
        setArtifacts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchArtifacts();
  }, [sessionId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Sessions
            </Link>
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium font-mono">{sessionId}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Session Artifacts
          </h1>
          <p className="text-gray-400">
            View and manage artifacts for this session
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {artifacts.length} {artifacts.length === 1 ? 'artifact' : 'artifacts'}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm">Loading artifacts...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <p className="font-medium">Error loading artifacts</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && artifacts.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
          <div className="text-4xl mb-4 opacity-50">📄</div>
          <h3 className="text-lg font-medium text-white mb-2">No artifacts found</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            This session doesn't have any artifacts yet.
          </p>
        </div>
      )}

      {/* Artifacts Grid */}
      {!loading && !error && artifacts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artifacts.map((artifact) => (
            <ArtifactCard
              key={artifact.filename}
              sessionId={sessionId}
              filename={artifact.filename}
              type={artifact.type}
              summary={artifact.summary}
              lastModified={new Date(artifact.lastModified)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
