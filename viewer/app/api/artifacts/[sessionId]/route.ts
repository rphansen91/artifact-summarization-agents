import { NextResponse } from 'next/server';
import { getArtifactsForSession } from '@/lib/artifacts';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const artifacts = await getArtifactsForSession(sessionId);
    return NextResponse.json(artifacts);
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: 500 });
  }
}
