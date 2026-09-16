import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const SESSION_SECONDS = 60 * 60 * 8;
export function validPassword(value: string, expected: string) {
  return timingSafeEqual(createHash('sha256').update(value).digest(), createHash('sha256').update(expected).digest());
}
function signature(payload: string, secret: string) {
  return createHmac('sha256', secret).update(`basicmails:session:v1:${payload}`).digest('base64url');
}
export function createSession(secret: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ exp: now + SESSION_SECONDS * 1000, nonce: randomBytes(24).toString('hex') })).toString('base64url');
  return `${payload}.${signature(payload, secret)}`;
}
export function verifySession(token: string | undefined, secret: string, now = Date.now()): { exp: number } | null {
  if (!token || token.length > 512 || secret.length < 16) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, provided] = parts;
  const expected = signature(payload, secret);
  if (provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof parsed.exp === 'number' && parsed.exp > now && parsed.exp <= now + SESSION_SECONDS * 1000 ? { exp: parsed.exp } : null;
  } catch { return null; }
}
export function mailboxKey(secret: string) {
  return createHmac('sha256', secret).update('basicmails:local-mailbox:v1').digest('base64');
}
