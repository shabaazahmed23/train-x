import { prisma } from './prisma';
import { ReminderType, ReminderStatus, MembershipStatus } from '@prisma/client';
import { sendEmail, buildFitlifeEmailHtml } from './email';
import { formatDate, formatCurrency } from './utils';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface ReminderJobResult {
  totalEligible: number;
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  details: Array<{
    membershipId: string;
    email: string;
    type: ReminderType;
    status: string;
    reason?: string;
  }>;
}

// Map days remaining to ReminderType
export function getApplicableReminderType(daysRemaining: number): ReminderType | null {
  if (daysRemaining === 7) return ReminderType.SEVEN_DAY;
  if (daysRemaining === 3) return ReminderType.THREE_DAY;
  if (daysRemaining === 1) return ReminderType.ONE_DAY;
  if (daysRemaining === 0) return ReminderType.EXPIRY_DAY;
  if (daysRemaining === -1) return ReminderType.POST_EXPIRY;
  return null;
}

// Generate Email Subject & Content per Reminder Type
export function getReminderContent(
  type: ReminderType,
  memberName: string,
  planName: string,
  expiryDateStr: string,
  daysRemaining: number,
  renewalPrice?: number
) {
  const priceDisplay = renewalPrice ? formatCurrency(renewalPrice) : undefined;

  switch (type) {
    case ReminderType.SEVEN_DAY:
      return {
        subject: `Your FITLIFE ${planName} Membership Expires in 7 Days`,
        preheader: `Renew your FITLIFE membership before ${expiryDateStr} to maintain seamless gym & wellness access.`,
        headline: 'Your Membership Renewal Window Is Open',
        body: [
          `We hope you are experiencing peak energy and results during your training journey at FITLIFE.`,
          `This is a courtesy reminder that your <strong>${planName}</strong> membership is scheduled to expire in <strong>7 days on ${expiryDateStr}</strong>.`,
          `To ensure uninterrupted entry to the fitness arena, recovery suites, and private lockers, please renew your access today.`,
        ],
        ctaText: 'Renew My Membership',
        ctaUrl: `${APP_URL}/member/renew`,
        highlights: [
          { label: 'Current Plan', value: planName },
          { label: 'Expiry Date', value: expiryDateStr },
          { label: 'Days Remaining', value: '7 Days' },
          ...(priceDisplay ? [{ label: 'Renewal Rate', value: priceDisplay }] : []),
        ],
      };

    case ReminderType.THREE_DAY:
      return {
        subject: `Notice: 3 Days Remaining on Your FITLIFE Membership`,
        preheader: `Only 3 days left on your ${planName} membership. Secure your renewal now.`,
        headline: '3 Days Until Your Membership Concludes',
        body: [
          `Your active membership for <strong>${planName}</strong> will conclude in just <strong>3 days (${expiryDateStr})</strong>.`,
          `Don't lose momentum on your athletic progression. Renewing now preserves all remaining days and guarantees priority booking with your preferred trainers.`,
        ],
        ctaText: 'Complete Quick Renewal',
        ctaUrl: `${APP_URL}/member/renew`,
        highlights: [
          { label: 'Membership Plan', value: planName },
          { label: 'Expires On', value: expiryDateStr },
          { label: 'Status', value: 'Expires in 72 Hours' },
          ...(priceDisplay ? [{ label: 'Standard Rate', value: priceDisplay }] : []),
        ],
      };

    case ReminderType.ONE_DAY:
      return {
        subject: `Urgent: Your FITLIFE Membership Expires Tomorrow`,
        preheader: `Your ${planName} membership expires tomorrow (${expiryDateStr}). Renew today.`,
        headline: 'Final Day of Active Access',
        body: [
          `Your FITLIFE <strong>${planName}</strong> access concludes tomorrow, <strong>${expiryDateStr}</strong>.`,
          `After tomorrow, biometric and turnstile access will automatically pause until your renewal is logged.`,
          `Take 60 seconds to lock in your renewal online or visit our front desk concierge.`,
        ],
        ctaText: 'Renew Immediately',
        ctaUrl: `${APP_URL}/member/renew`,
        highlights: [
          { label: 'Active Plan', value: planName },
          { label: 'Final Active Day', value: expiryDateStr },
          { label: 'Action Required', value: 'Immediate Renewal' },
        ],
      };

    case ReminderType.EXPIRY_DAY:
      return {
        subject: `Your FITLIFE Membership Has Expired Today`,
        preheader: `Your ${planName} membership expired today. Re-activate your access in one click.`,
        headline: 'Your Membership Has Reached Expiry',
        body: [
          `Your <strong>${planName}</strong> membership has reached its scheduled conclusion today (${expiryDateStr}).`,
          `We value having you as part of our elite fitness community. You can instantly reactivate your account at any time through our member portal.`,
        ],
        ctaText: 'Re-Activate Membership',
        ctaUrl: `${APP_URL}/member/renew`,
        highlights: [
          { label: 'Plan Name', value: planName },
          { label: 'Expiration Date', value: expiryDateStr },
          { label: 'Account State', value: 'Awaiting Renewal' },
        ],
      };

    case ReminderType.POST_EXPIRY:
    default:
      return {
        subject: `We Miss You at FITLIFE - Exclusive Comeback Privilege`,
        preheader: `Reactivate your FITLIFE membership and step back into peak performance.`,
        headline: 'Continue Your Fitness Journey With Us',
        body: [
          `It has been a few days since your <strong>${planName}</strong> expired.`,
          `Your coaches, recovery suites, and personalized fitness targets are waiting for you. Log in today to review our latest seasonal privileges and reactivate your membership.`,
        ],
        ctaText: 'Rejoin FITLIFE',
        ctaUrl: `${APP_URL}/member/renew`,
        highlights: [
          { label: 'Previous Plan', value: planName },
          { label: 'Status', value: 'Eligible for Loyalty Renewal' },
        ],
      };
  }
}

// Automated Reminders Engine Execution
export async function runMembershipReminderEngine(): Promise<ReminderJobResult> {
  const result: ReminderJobResult = {
    totalEligible: 0,
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    details: [],
  };

  const now = new Date();
  // Fetch gym settings to see enabled reminder days
  const settings = await prisma.gymSettings.findUnique({
    where: { id: 'default-settings' },
  });
  const configuredDays: number[] = settings?.reminderLeadDays
    ? JSON.parse(settings.reminderLeadDays)
    : [7, 3, 1, 0];

  // Fetch all active or expiring memberships
  const memberships = await prisma.membership.findMany({
    where: {
      status: {
        in: [MembershipStatus.ACTIVE, MembershipStatus.EXPIRING_SOON, MembershipStatus.EXPIRED],
      },
    },
    include: {
      plan: true,
      member: {
        include: {
          user: true,
          renewals: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
      reminders: true,
    },
  });

  result.totalEligible = memberships.length;

  for (const m of memberships) {
    const user = m.member.user;
    if (!user || !user.email) continue;

    // Check if superseded by a newer active membership
    const hasNewerMembership = await prisma.membership.findFirst({
      where: {
        memberId: m.memberId,
        id: { not: m.id },
        startDate: { gte: m.endDate },
        status: { in: [MembershipStatus.ACTIVE, MembershipStatus.PENDING] },
      },
    });

    if (hasNewerMembership) {
      // Cancel pending reminders for superseded membership
      await prisma.emailReminder.updateMany({
        where: {
          membershipId: m.id,
          status: ReminderStatus.PENDING,
        },
        data: { status: ReminderStatus.CANCELLED },
      });
      result.skipped++;
      result.details.push({
        membershipId: m.id,
        email: user.email,
        type: ReminderType.EXPIRY_DAY,
        status: 'SKIPPED',
        reason: 'Superseded by newer renewed membership',
      });
      continue;
    }

    // Calculate days remaining (UTC midnight normalized comparison)
    const endMidnight = new Date(m.endDate);
    endMidnight.setHours(0, 0, 0, 0);

    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);

    const diffDays = Math.round((endMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

    // Update status if needed
    if (diffDays <= 0 && m.status !== MembershipStatus.EXPIRED) {
      await prisma.membership.update({
        where: { id: m.id },
        data: { status: MembershipStatus.EXPIRED },
      });
    } else if (diffDays <= 7 && diffDays > 0 && m.status === MembershipStatus.ACTIVE) {
      await prisma.membership.update({
        where: { id: m.id },
        data: { status: MembershipStatus.EXPIRING_SOON },
      });
    }

    // Determine if today matches one of the configured lead times
    if (!configuredDays.includes(diffDays)) {
      continue;
    }

    const reminderType = getApplicableReminderType(diffDays);
    if (!reminderType) continue;

    result.processed++;

    // IDEMPOTENCY CHECK:
    // Check if reminder was already recorded for this (membershipId, reminderType)
    const existingReminder = await prisma.emailReminder.findUnique({
      where: {
        membershipId_reminderType: {
          membershipId: m.id,
          reminderType,
        },
      },
    });

    if (existingReminder && (existingReminder.status === ReminderStatus.SENT || existingReminder.status === ReminderStatus.CANCELLED)) {
      result.skipped++;
      result.details.push({
        membershipId: m.id,
        email: user.email,
        type: reminderType,
        status: 'SKIPPED',
        reason: `Already ${existingReminder.status.toLowerCase()} on ${existingReminder.sentAt ? formatDate(existingReminder.sentAt) : 'record'}`,
      });
      continue;
    }

    // Build the email content
    const expiryStr = formatDate(m.endDate);
    const content = getReminderContent(
      reminderType,
      user.name || 'Valued Member',
      m.plan.name,
      expiryStr,
      diffDays,
      Number(m.plan.price)
    );

    const emailHtml = buildFitlifeEmailHtml({
      preheader: content.preheader,
      headline: content.headline,
      recipientName: user.name || 'Valued Member',
      bodyContent: content.body,
      ctaText: content.ctaText,
      ctaUrl: content.ctaUrl,
      highlightBox: content.highlights,
    });

    // Create or update record as PENDING / RETRYING
    const reminderRecord = await prisma.emailReminder.upsert({
      where: {
        membershipId_reminderType: {
          membershipId: m.id,
          reminderType,
        },
      },
      update: {
        attemptCount: { increment: 1 },
        status: ReminderStatus.RETRYING,
      },
      create: {
        membershipId: m.id,
        memberEmail: user.email,
        reminderType,
        scheduledDate: now,
        status: ReminderStatus.PENDING,
        attemptCount: 1,
      },
    });

    // Dispatch email
    const sendResult = await sendEmail({
      to: user.email,
      subject: content.subject,
      templateType: `REMINDER_${reminderType}`,
      html: emailHtml,
    });

    if (sendResult.success) {
      await prisma.emailReminder.update({
        where: { id: reminderRecord.id },
        data: {
          status: ReminderStatus.SENT,
          providerMessageId: sendResult.messageId,
          sentAt: new Date(),
          lastError: null,
        },
      });

      // Create in-app notification as well
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: content.subject,
          message: `Your ${m.plan.name} membership expires on ${expiryStr}. Click here to renew.`,
          type: 'EXPIRY_WARNING',
        },
      });

      result.sent++;
      result.details.push({
        membershipId: m.id,
        email: user.email,
        type: reminderType,
        status: 'SENT',
      });
    } else {
      await prisma.emailReminder.update({
        where: { id: reminderRecord.id },
        data: {
          status: ReminderStatus.FAILED,
          lastError: sendResult.error || 'Provider rejection',
        },
      });

      result.failed++;
      result.details.push({
        membershipId: m.id,
        email: user.email,
        type: reminderType,
        status: 'FAILED',
        reason: sendResult.error,
      });
    }
  }

  return result;
}

// Send Welcome Email
export async function sendWelcomeEmail(userName: string, userEmail: string) {
  const html = buildFitlifeEmailHtml({
    preheader: 'Welcome to FITLIFE Luxury Fitness Club. Your account is ready.',
    headline: 'Welcome to FITLIFE',
    recipientName: userName,
    bodyContent: [
      'Congratulations on taking the first step towards athletic excellence and balanced vitality.',
      'Your FITLIFE digital account has been established. You can now explore membership packages, book sessions with our elite coaching staff, and track your biometrics.',
    ],
    ctaText: 'Access Member Portal',
    ctaUrl: `${APP_URL}/member`,
    highlightBox: [
      { label: 'Registered Email', value: userEmail },
      { label: 'Club Location', value: 'Bangalore Financial District' },
    ],
  });

  return sendEmail({
    to: userEmail,
    subject: 'Welcome to FITLIFE Luxury Fitness Club',
    templateType: 'WELCOME',
    html,
  });
}

// Send Renewal Confirmation Email
export async function sendRenewalConfirmationEmail({
  userEmail,
  userName,
  planName,
  newEndDate,
  amountPaid,
  receiptNumber,
}: {
  userEmail: string;
  userName: string;
  planName: string;
  newEndDate: Date;
  amountPaid: number;
  receiptNumber: string;
}) {
  const html = buildFitlifeEmailHtml({
    preheader: `Your FITLIFE membership has been successfully renewed through ${formatDate(newEndDate)}.`,
    headline: 'Membership Renewal Confirmed',
    recipientName: userName,
    bodyContent: [
      `Thank you for renewing your commitment to fitness at FITLIFE.`,
      `Your <strong>${planName}</strong> membership is now confirmed and extended through <strong>${formatDate(newEndDate)}</strong>.`,
      `Your turnstile access, app perks, and trainer privileges continue without disruption.`,
    ],
    ctaText: 'View Membership Dashboard',
    ctaUrl: `${APP_URL}/member`,
    highlightBox: [
      { label: 'Renewed Plan', value: planName },
      { label: 'New Expiry Date', value: formatDate(newEndDate) },
      { label: 'Amount Paid', value: formatCurrency(amountPaid) },
      { label: 'Receipt Number', value: receiptNumber },
    ],
  });

  return sendEmail({
    to: userEmail,
    subject: `FITLIFE Membership Successfully Renewed - Receipt ${receiptNumber}`,
    templateType: 'MEMBERSHIP_RENEWED',
    html,
  });
}

// Send Booking Confirmation Email
export async function sendBookingConfirmationEmail({
  userEmail,
  userName,
  trainerName,
  bookingDate,
  timeSlot,
}: {
  userEmail: string;
  userName: string;
  trainerName: string;
  bookingDate: Date;
  timeSlot: string;
}) {
  const html = buildFitlifeEmailHtml({
    preheader: `Your private training session with Coach ${trainerName} is confirmed.`,
    headline: 'Personal Training Session Confirmed',
    recipientName: userName,
    bodyContent: [
      `Your personal coaching appointment with <strong>Coach ${trainerName}</strong> has been secured on our schedule.`,
      `Please arrive 10 minutes prior to your session time in proper athletic attire. Hydration and sweat towels are provided complimentary in the training pavilion.`,
    ],
    ctaText: 'View Your Schedule',
    ctaUrl: `${APP_URL}/member/bookings`,
    highlightBox: [
      { label: 'Coach', value: trainerName },
      { label: 'Date', value: formatDate(bookingDate) },
      { label: 'Time Slot', value: timeSlot },
      { label: 'Location', value: 'Private Training Suite, Level 4' },
    ],
  });

  return sendEmail({
    to: userEmail,
    subject: `Training Session Confirmed with Coach ${trainerName}`,
    templateType: 'BOOKING_CONFIRMED',
    html,
  });
}
