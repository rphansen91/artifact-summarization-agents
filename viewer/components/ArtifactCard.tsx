import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface ArtifactCardProps {
  sessionId: string;
  filename: string;
  type: string;
  summary: string;
  lastModified: Date;
}

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  implementation_plan: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  walkthrough: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/20',
  },
  task: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
  },
  other: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    border: 'border-gray-500/20',
  },
};

export default function ArtifactCard({ sessionId, filename, type, summary, lastModified }: ArtifactCardProps) {
  const colors = typeColors[type] || typeColors.other;
  const formattedDate = new Date(lastModified).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Remove .md extension for display
  const displayName = filename.replace(/\.md$/, '');

  return (
    <Link href={`/artifact/${sessionId}/${filename}`} className="block stagger-item group h-full">
      <Card className="h-full flex flex-col border-white/5 group-hover:border-indigo-500/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors flex-1 pr-4 truncate">
            {displayName}
          </h3>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${colors.bg} ${colors.text} ${colors.border} uppercase tracking-wider`}>
            {type.replace(/_/g, ' ')}
          </span>
        </div>
        
        <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
          {summary}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-white/5 mt-auto">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formattedDate}
        </div>
      </Card>
    </Link>
  );
}
