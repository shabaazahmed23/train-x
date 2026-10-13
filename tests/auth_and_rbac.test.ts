import test from 'node:test';
import assert from 'node:assert';
import { hashPassword, verifyPassword, signSessionToken, verifySessionToken } from '../src/lib/auth';
import { Role } from '@prisma/client';

test('Authentication: hashes and verifies passwords correctly', async () => {
  const password = 'StrongPassword123!';
  const hash = await hashPassword(password);

  assert.notStrictEqual(password, hash);
  const isValid = await verifyPassword(password, hash);
  assert.strictEqual(isValid, true);

  const isInvalid = await verifyPassword('WrongPassword', hash);
  assert.strictEqual(isInvalid, false);
});

test('Session: creates and verifies JWT session cookies with RBAC payload', async () => {
  const adminUser = {
    id: 'user-admin-123',
    email: 'admin@fitlife.com',
    name: 'Fitlife Admin',
    role: Role.ADMIN,
  };

  const token = await signSessionToken(adminUser);
  assert.ok(typeof token === 'string' && token.length > 20);

  const decoded = await verifySessionToken(token);
  assert.ok(decoded !== null);
  assert.strictEqual(decoded.id, adminUser.id);
  assert.strictEqual(decoded.email, adminUser.email);
  assert.strictEqual(decoded.role, Role.ADMIN);

  const memberUser = {
    id: 'user-member-456',
    email: 'member@example.com',
    name: 'John Doe',
    role: Role.MEMBER,
  };

  const memberToken = await signSessionToken(memberUser);
  const decodedMember = await verifySessionToken(memberToken);
  assert.ok(decodedMember !== null);
  assert.strictEqual(decodedMember.role, Role.MEMBER);
});
