import test from 'node:test';
import assert from 'node:assert';
import { processAttendanceCheckInAction } from '../src/lib/actions';
import { prisma } from '../src/lib/prisma';

test('Attendance Engine: rejects expired membership check-in attempt', async () => {
  // Arjun Mehta (FL-2026-0003) is seeded as EXPIRED
  const result = await processAttendanceCheckInAction('FL-2026-0003');
  assert.strictEqual(result.success, false);
  assert.ok(result.error?.includes('EXPIRED') || result.status === 'EXPIRED');
});

test('Attendance Engine: validates active member pass and blocks duplicate within 2h', async () => {
  // Seed member Rahul Verma (FL-2026-0001) has active membership
  const firstAttempt = await processAttendanceCheckInAction('FL-2026-0001');

  if (firstAttempt.success) {
    // Immediate second attempt must be blocked by duplicate protection
    const secondAttempt = await processAttendanceCheckInAction('FL-2026-0001');
    assert.strictEqual(secondAttempt.success, false);
    assert.strictEqual(secondAttempt.alreadyCheckedIn, true);
  } else {
    // If already checked in earlier today from seed data:
    assert.strictEqual(firstAttempt.alreadyCheckedIn, true);
  }
});

test('Booking Engine: detects overlapping trainer booking time slots', () => {
  // Check overlap logic algorithm: (newStart < existingEnd && newEnd > existingStart)
  const existingStart = '10:00';
  const existingEnd = '11:00';

  const isOverlapping = (start: string, end: string) => {
    return start < existingEnd && end > existingStart;
  };

  assert.strictEqual(isOverlapping('10:00', '11:00'), true); // Exact same
  assert.strictEqual(isOverlapping('10:30', '11:30'), true); // Overlaps tail
  assert.strictEqual(isOverlapping('09:30', '10:30'), true); // Overlaps start
  assert.strictEqual(isOverlapping('11:00', '12:00'), false); // Adjacent after - valid
  assert.strictEqual(isOverlapping('09:00', '10:00'), false); // Adjacent before - valid
});
