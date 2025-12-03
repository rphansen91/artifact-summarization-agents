import { notFound } from 'next/navigation';
import { WeeklyDetailsView } from '@/components/WeeklyDetailsView';
import path from 'path';

interface PageProps {
  searchParams: Promise<{
    path?: string;
  }>;
}

export default async function WeekDetailsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  console.log('WeekDetailsPage searchParams:', resolvedSearchParams);
  
  if (!resolvedSearchParams.path) {
    console.log('No path in searchParams');
    notFound();
  }
  
  const weekPath = resolvedSearchParams.path;
  const weekName = path.basename(weekPath);
  
  console.log('Week path:', weekPath);
  console.log('Week name:', weekName);

  // Basic validation - ensure this looks like a week path
  if (!weekName.toLowerCase().includes('week')) {
    console.log('Week validation failed for:', weekName);
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <WeeklyDetailsView weekPath={weekPath} weekName={weekName} />
    </main>
  );
}