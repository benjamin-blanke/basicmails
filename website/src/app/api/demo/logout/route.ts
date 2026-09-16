import { NextResponse } from 'next/server';
import { COOKIE_NAME, sameOrigin } from '@/lib/demo/auth';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
