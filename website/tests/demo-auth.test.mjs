import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, verifySession, validPassword, mailboxKey, SESSION_SECONDS } from '../src/lib/demo/crypto.ts';

const password = 'test-only-password-with-enough-entropy';
const now = 1700000000000;
test('correct password passes; wrong passwords and Unicode mismatches fail', () => {
  assert.equal(validPassword(password, password), true);
  assert.equal(validPassword('wrong', password), false);
  assert.equal(validPassword('pássword', 'password'), false);
});
test('session expires, cannot be modified, and password rotation revokes it', () => {
  const token = createSession(password, now);
  assert.ok(verifySession(token, password, now + 1000));
  assert.equal(verifySession(token, password, now + SESSION_SECONDS * 1000), null);
  assert.equal(verifySession(token, 'another-strong-test-password', now), null);
  const [payload, signature] = token.split('.');
  const changed = Buffer.from(JSON.stringify({ exp: now + 999999999 })).toString('base64url');
  assert.equal(verifySession(`${changed}.${signature}`, password, now), null);
  assert.equal(verifySession(`${payload}.invalid`, password, now), null);
  assert.equal(verifySession(undefined, password, now), null);
  assert.equal(verifySession(token, '', now), null);
  assert.equal(verifySession('x'.repeat(1000), password, now), null);
});
test('each session is unique and mailbox encryption key rotates with password', () => {
  assert.notEqual(createSession(password, now), createSession(password, now));
  assert.equal(Buffer.from(mailboxKey(password), 'base64').length, 32);
  assert.notEqual(mailboxKey(password), mailboxKey('another-strong-test-password'));
});
