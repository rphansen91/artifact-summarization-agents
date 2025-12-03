'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMostRecentWeekPath } from './actions';
import SessionCard from '@/components/SessionCard';

interface Session {
  id: string;
  path: string;
  artifactCount: number;
  lastModified: string;
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function redirectToMostRecentWeek() {
      try {
        const mostRecentWeekPath = await getMostRecentWeekPath();
        if (mostRecentWeekPath) {
          const encodedPath = encodeURIComponent(mostRecentWeekPath);
          router.push(`/week-details?path=${encodedPath}`);
        } else {
          // Fallback to existing behavior if no weeks found
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to find most recent week:', error);
        setLoading(false);
      }
    }

    redirectToMostRecentWeek();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 text-sm">Redirecting to most recent week...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Artifacts Browser
          </h1>
          <p className="text-gray-400">
            No weekly artifacts found. Use the sidebar to browse individual sessions.
          </p>
        </div>
      </div>

      <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
        <div className="text-4xl mb-4 opacity-50">📅</div>
        <h3 className="text-lg font-medium text-white mb-2">No weekly artifacts found</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          No weekly artifact folders were found. Use the sidebar to browse individual sessions and artifacts.
        </p>
      </div>
    </div>
  );
}
