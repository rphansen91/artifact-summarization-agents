import { NextResponse } from 'next/server';
import { getSessionDirectories } from '@/lib/artifacts';

export async function GET() {
  try {
    const sessions = await getSessionDirectories();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
