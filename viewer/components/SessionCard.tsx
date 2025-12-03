import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface SessionCardProps {
  id: string;
  artifactCount: number;
  lastModified: Date;
}

export default function SessionCard({ id, artifactCount, lastModified }: SessionCardProps) {
  const formattedDate = new Date(lastModified).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link href={`/session/${id}`} className="block stagger-item group">
      <Card className="h-full border-indigo-500/10 group-hover:border-indigo-500/50 transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors truncate font-mono">
              {id}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Session ID</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-sm border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
            {artifactCount}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/5">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {artifactCount} {artifactCount === 1 ? 'artifact' : 'artifacts'}
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formattedDate}
          </span>
        </div>
      </Card>
    </Link>
  );
}
