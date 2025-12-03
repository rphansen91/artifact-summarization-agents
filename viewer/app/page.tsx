'use client';

import { useEffect, useState } from 'react';
import SessionCard from '@/components/SessionCard';

interface Session {
  id: string;
  path: string;
  artifactCount: number;
  lastModified: string;
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('/api/artifacts');
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Brain Sessions
          </h1>
          <p className="text-gray-400">
            Manage and view your Antigravity sessions and artifacts
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm">Loading sessions...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <p className="font-medium">Error loading sessions</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
          <div className="text-4xl mb-4 opacity-50">📁</div>
          <h3 className="text-lg font-medium text-white mb-2">No sessions found</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            No brain sessions are available yet. Start using Antigravity to create artifacts!
          </p>
        </div>
      )}

      {!loading && !error && sessions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              id={session.id}
              artifactCount={session.artifactCount}
              lastModified={new Date(session.lastModified)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
