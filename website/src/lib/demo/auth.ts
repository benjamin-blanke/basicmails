import 'server-only';
import { cookies } from 'next/headers';
import { verifySession } from './crypto';

export const COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-basicmails-demo' : 'basicmails-demo';
export function demoPassword() {
  const password = process.env.DEMO_PASSWORD;
  return password && password.length >= 16 ? password : null;
}
export async function getSession() {
  const password = demoPassword();
  if (!password) return null;
  return verifySession((await cookies()).get(COOKIE_NAME)?.value, password);
}
export function sameOrigin(request: Request) {
  try {
    const origin = new URL(request.headers.get('origin') ?? '');
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ?? new URL(request.url).protocol.replace(':', '');
    return Boolean(host) && origin.host === host && origin.protocol === `${protocol}:`;
  } catch { return false; }
}
