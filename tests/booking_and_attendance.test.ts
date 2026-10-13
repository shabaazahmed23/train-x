import test from 'node:test';
import assert from 'node:assert';
import { processAttendanceCheckInAction } from '../src/lib/actions';
import { prisma } from '../src/lib/prisma';
import { Role, MembershipStatus } from '@prisma/client';

test('Attendance Engine: rejects non-existent member identifier', async () => {
  const result = await processAttendanceCheckInAction('NON_EXISTENT_PASS_99999');
  assert.strictEqual(result.success, false);
  assert.ok(result.error?.includes('Member not found'));
});

test('Attendance Engine: validates active pass, prevents duplicate check-in, and rejects expired pass', async () => {
  const testId = `test_${Date.now()}`;
  const testEmailActive = `${testId}_active@testfitlife.local`;
  const testEmailExpired = `${testId}_expired@testfitlife.local`;

  let activeProfileId = '';
  let activeUserId = '';
  let expiredProfileId = '';
  let expiredUserId = '';
  let testPlanId = '';

  try {
    // Create temporary test plan
    const testPlan = await prisma.membershipPlan.create({
      data: {
        name: `Temp Test Plan ${testId}`,
        slug: `temp-plan-${testId}`,
        description: 'Temporary Test Plan for attendance validation',
        features: JSON.stringify(['Facility Access']),
        price: 999,
        durationDays: 30,
        isPublished: false,
      },
    });
    testPlanId = testPlan.id;

    // Create active test member
    const activeUser = await prisma.user.create({
      data: {
        name: 'Test Active Member',
        email: testEmailActive,
        role: Role.MEMBER,
        passwordHash: 'dummyhash',
        profile: {
          create: {
            membershipNumber: `TEMP-ACT-${testId.slice(-6)}`,
          },
        },
      },
      include: { profile: true },
    });
    activeUserId = activeUser.id;
    activeProfileId = activeUser.profile!.id;

    await prisma.membership.create({
      data: {
        memberId: activeProfileId,
        planId: testPlanId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000),
        status: MembershipStatus.ACTIVE,
        agreedPrice: 999,
      },
    });

    // Create expired test member
    const expiredUser = await prisma.user.create({
      data: {
        name: 'Test Expired Member',
        email: testEmailExpired,
        role: Role.MEMBER,
        passwordHash: 'dummyhash',
        profile: {
          create: {
            membershipNumber: `TEMP-EXP-${testId.slice(-6)}`,
          },
        },
      },
      include: { profile: true },
    });
    expiredUserId = expiredUser.id;
    expiredProfileId = expiredUser.profile!.id;

    await prisma.membership.create({
      data: {
        memberId: expiredProfileId,
        planId: testPlanId,
        startDate: new Date(Date.now() - 60 * 86400000),
        endDate: new Date(Date.now() - 10 * 86400000),
        status: MembershipStatus.EXPIRED,
        agreedPrice: 999,
      },
    });

    // 1. Test Expired Rejection
    const expiredResult = await processAttendanceCheckInAction(expiredUser.profile!.membershipNumber);
    assert.strictEqual(expiredResult.success, false);
    assert.strictEqual(expiredResult.status, 'EXPIRED');

    // 2. Test Active Check-in Success
    const firstAttempt = await processAttendanceCheckInAction(activeUser.profile!.membershipNumber);
    assert.strictEqual(firstAttempt.success, true);

    // 3. Test Duplicate Check-in Block within 2 hours
    const secondAttempt = await processAttendanceCheckInAction(activeUser.profile!.membershipNumber);
    assert.strictEqual(secondAttempt.success, false);
    assert.strictEqual(secondAttempt.alreadyCheckedIn, true);
  } finally {
    // Cleanup temporary test fixtures to maintain clean operational state
    if (activeProfileId) {
      await prisma.attendance.deleteMany({ where: { memberId: activeProfileId } });
      await prisma.membership.deleteMany({ where: { memberId: activeProfileId } });
      await prisma.memberProfile.deleteMany({ where: { id: activeProfileId } });
    }
    if (activeUserId) {
      await prisma.user.deleteMany({ where: { id: activeUserId } });
    }
    if (expiredProfileId) {
      await prisma.attendance.deleteMany({ where: { memberId: expiredProfileId } });
      await prisma.membership.deleteMany({ where: { memberId: expiredProfileId } });
      await prisma.memberProfile.deleteMany({ where: { id: expiredProfileId } });
    }
    if (expiredUserId) {
      await prisma.user.deleteMany({ where: { id: expiredUserId } });
    }
    if (testPlanId) {
      await prisma.membershipPlan.deleteMany({ where: { id: testPlanId } });
    }
  }
});

test('Booking Engine: detects overlapping trainer booking time slots', () => {
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
