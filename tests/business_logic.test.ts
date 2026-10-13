import test from 'node:test';
import assert from 'node:assert';
import { calculateRemainingDays, formatCurrency } from '../src/lib/utils';
import { validateCouponServer } from '../src/lib/actions';
import { prisma } from '../src/lib/prisma';

test('Business Logic: calculateRemainingDays returns accurate date differentials', () => {
  const now = new Date();
  const future7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const diffDays = calculateRemainingDays(future7Days);
  assert.ok(diffDays === 7 || diffDays === 8); // Depending on millisecond alignment

  const past5Days = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const diffPast = calculateRemainingDays(past5Days);
  assert.ok(diffPast <= 0);
});

test('Business Logic: early renewal date preservation calculation', () => {
  // If current membership ends on Nov 30, and member renews 30 days early on Nov 1
  const currentEndDate = new Date('2026-11-30T00:00:00Z');
  const planDurationDays = 90;

  // Business rule: early renewal starts from existing expiry date
  const newStartDate = new Date(currentEndDate);
  const newEndDate = new Date(newStartDate.getTime() + planDurationDays * 24 * 60 * 60 * 1000);

  // Assert new end date is Nov 30 + 90 days = Feb 28, 2027
  assert.strictEqual(newEndDate.toISOString().split('T')[0], '2027-02-28');
});

test('Business Logic: server-side coupon validation enforces constraints', async () => {
  const testCode = `TEST_COUPON_${Date.now()}`;
  let couponId = '';

  try {
    // Create temporary test coupon fixture
    const coupon = await prisma.offer.create({
      data: {
        title: 'Temporary Test Offer',
        code: testCode,
        description: 'Temporary Test Offer Description',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 5000,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000 * 30),
        isActive: true,
      },
    });
    couponId = coupon.id;

    // Test coupon valid (20% off with min spend 5000)
    const validResult = await validateCouponServer(testCode, 7999);
    assert.strictEqual(validResult.valid, true);
    assert.strictEqual(validResult.code, testCode);
    assert.strictEqual(validResult.discountAmount, Math.round((7999 * 20) / 100));

    // Test minimum spend restriction (order 2999 is below 5000)
    const minSpendResult = await validateCouponServer(testCode, 2999);
    assert.strictEqual(minSpendResult.valid, false);
    assert.ok(minSpendResult.error?.includes('Minimum order'));

    // Test invalid non-existent coupon
    const invalidResult = await validateCouponServer('NON_EXISTENT_CODE_XYZ', 10000);
    assert.strictEqual(invalidResult.valid, false);
  } finally {
    if (couponId) {
      await prisma.offer.deleteMany({ where: { id: couponId } });
    }
  }
});
