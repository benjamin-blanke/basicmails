import { NextResponse } from 'next/server';
import { getSession } from '@/lib/demo/auth';
export async function GET() {
  const session = await getSession();
  return NextResponse.json(session ? { authenticated: true, expiresAt: session.exp } : { authenticated: false }, { status: session ? 200 : 401, headers: { 'Cache-Control': 'no-store, private' } });
}
