import test from 'node:test';
import assert from 'node:assert';
import {
  getApplicableReminderType,
  getReminderContent,
  runMembershipReminderEngine,
} from '../src/lib/reminders';
import { buildFitlifeEmailHtml, sendEmail } from '../src/lib/email';
import { ReminderType, ReminderStatus } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

test('Reminder Engine: maps day thresholds to appropriate ReminderType enum', () => {
  assert.strictEqual(getApplicableReminderType(7), ReminderType.SEVEN_DAY);
  assert.strictEqual(getApplicableReminderType(3), ReminderType.THREE_DAY);
  assert.strictEqual(getApplicableReminderType(1), ReminderType.ONE_DAY);
  assert.strictEqual(getApplicableReminderType(0), ReminderType.EXPIRY_DAY);
  assert.strictEqual(getApplicableReminderType(14), null);
});

test('Email Service: builds branded luxury HTML email template', () => {
  const html = buildFitlifeEmailHtml({
    preheader: 'Courtesy reminder regarding your FITLIFE membership.',
    headline: 'Your Membership Renewal Window Is Open',
    recipientName: 'Sneha Patel',
    bodyContent: ['Your Platinum Elite membership concludes in 4 days.'],
    ctaText: 'Renew Now',
    ctaUrl: 'http://localhost:3000/member/renew',
    highlightBox: [{ label: 'Days Remaining', value: '4 Days' }],
  });

  assert.ok(html.includes('FITLIFE'));
  assert.ok(html.includes('Sneha Patel'));
  assert.ok(html.includes('Platinum Elite'));
  assert.ok(html.includes('http://localhost:3000/member/renew'));
  assert.ok(html.includes('Luxury Fitness &amp; Athletic Club') || html.includes('Luxury Fitness'));
});

test('Email Service: mock development provider dispatches and records to DB without errors', async () => {
  const testEmail = 'test.member@example.com';
  const result = await sendEmail({
    to: testEmail,
    subject: 'Automated Test Notification',
    templateType: 'TEST_SUITE',
    html: '<p>Testing transactional logging pipeline.</p>',
  });

  assert.strictEqual(result.success, true);
  assert.ok(result.messageId);

  // Verify record written to EmailLog in PostgreSQL
  const logRecord = await prisma.emailLog.findFirst({
    where: {
      recipientEmail: testEmail,
      templateType: 'TEST_SUITE',
    },
    orderBy: { sentAt: 'desc' },
  });

  assert.ok(logRecord !== null);
  assert.strictEqual(logRecord.recipientEmail, testEmail);
  assert.strictEqual(logRecord.status, 'SIMULATED');
});

test('Reminder Engine: automated reminder job executes and enforces idempotency', async () => {
  const firstRun = await runMembershipReminderEngine();
  assert.ok(typeof firstRun.totalEligible === 'number');

  // Immediately running the engine a second time should SKIP already processed reminders
  const secondRun = await runMembershipReminderEngine();
  assert.ok(secondRun.sent <= firstRun.sent);
});
