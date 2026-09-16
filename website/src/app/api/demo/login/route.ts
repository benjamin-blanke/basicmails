import { NextResponse } from 'next/server';
import { COOKIE_NAME, demoPassword, sameOrigin } from '@/lib/demo/auth';
import { createSession, SESSION_SECONDS, validPassword } from '@/lib/demo/crypto';

export const runtime = 'nodejs';
// Best-effort per-instance throttling; a strong shared demo password is required.
const attempts = new Map<string, { count: number; reset: number }>();
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  const password = demoPassword();
  if (!password) return NextResponse.json({ error: 'Demo access is not configured yet.' }, { status: 503 });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.reset < now) attempts.delete(key);
  const entry = attempts.get(ip) ?? { count: 0, reset: now + 15 * 60 * 1000 };
  if (entry.count >= 8) return NextResponse.json({ error: 'Too many attempts. Please try again in 15 minutes.' }, { status: 429, headers: { 'Retry-After': '900' } });
  if (attempts.size > 5000) attempts.clear();
  entry.count++; attempts.set(ip, entry);
  if (!request.headers.get('content-type')?.includes('application/json')) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  let value: unknown;
  try { const body = await request.text(); if (body.length > 2048) throw new Error(); value = JSON.parse(body).password; } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (typeof value !== 'string' || value.length > 512 || !validPassword(value, password)) return NextResponse.json({ error: 'That password is not correct.' }, { status: 401 });
  attempts.delete(ip);
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(COOKIE_NAME, createSession(password), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: SESSION_SECONDS });
  return response;
}
