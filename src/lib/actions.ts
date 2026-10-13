'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import {
  getSession,
  requireAuth,
  requireAdmin,
  createSessionCookie,
  removeSessionCookie,
  hashPassword,
  verifyPassword,
} from './auth';
import {
  generateMembershipNumber,
  generateReceiptNumber,
} from './utils';
import {
  Role,
  MembershipStatus,
  PaymentMethod,
  PaymentStatus,
  AttendanceMethod,
  BookingStatus,
  DiscountType,
  ReminderStatus,
} from '@prisma/client';
import {
  sendWelcomeEmail,
  sendRenewalConfirmationEmail,
  sendBookingConfirmationEmail,
} from './reminders';
import { sendEmail } from './email';

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // In standalone node tests or outside Next request context, safely no-op
  }
}

// ==========================================
// AUTHENTICATION ACTIONS
// ==========================================

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Invalid email or password.' };
  }

  await createSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return {
    success: true,
    role: user.role,
    redirectTo: user.role === Role.ADMIN ? '/admin' : '/member',
  };
}

export async function registerAction(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const phone = (formData.get('phone') as string)?.trim();

  if (!name || !email || !password) {
    return { success: false, error: 'Name, email, and password are required.' };
  }

  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(password);
  const userCount = await prisma.memberProfile.count();
  const membershipNumber = generateMembershipNumber(userCount + 1);

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      phone,
      role: Role.MEMBER,
      emailVerified: new Date(),
      profile: {
        create: {
          membershipNumber,
        },
      },
    },
    include: { profile: true },
  });

  await createSessionCookie({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
  });

  // Dispatch Welcome Email asynchronously
  sendWelcomeEmail(newUser.name, newUser.email).catch((e) =>
    console.error('Failed to send welcome email:', e)
  );

  return { success: true, redirectTo: '/member' };
}

export async function logoutAction() {
  await removeSessionCookie();
  return { success: true, redirectTo: '/login' };
}

// ==========================================
// SERVER-SIDE PRICING & COUPON VALIDATION
// ==========================================

export async function validateCouponServer(code: string, subtotal: number) {
  if (!code || !code.trim()) {
    return { valid: false, discountAmount: 0, error: 'Coupon code cannot be empty' };
  }

  const cleanCode = code.trim().toUpperCase();
  const offer = await prisma.offer.findUnique({
    where: { code: cleanCode },
  });

  if (!offer || !offer.isActive) {
    return { valid: false, discountAmount: 0, error: 'Invalid or inactive promotional code.' };
  }

  const now = new Date();
  if (now < offer.startDate || now > offer.endDate) {
    return { valid: false, discountAmount: 0, error: 'This promotional code has expired.' };
  }

  if (offer.usageLimit && offer.timesUsed >= offer.usageLimit) {
    return { valid: false, discountAmount: 0, error: 'Promotional coupon usage limit reached.' };
  }

  if (subtotal < Number(offer.minOrderAmount)) {
    return {
      valid: false,
      discountAmount: 0,
      error: `Minimum order of ₹${Number(offer.minOrderAmount).toLocaleString('en-IN')} required.`,
    };
  }

  let discount = 0;
  if (offer.discountType === DiscountType.PERCENTAGE) {
    discount = (subtotal * Number(offer.discountValue)) / 100;
    if (offer.maxDiscountAmount && discount > Number(offer.maxDiscountAmount)) {
      discount = Number(offer.maxDiscountAmount);
    }
  } else {
    discount = Number(offer.discountValue);
  }

  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    offerId: offer.id,
    code: offer.code,
    title: offer.title,
    discountAmount: Math.round(discount),
    finalPrice: Math.round(subtotal - discount),
  };
}

export async function calculatePlanPriceServer(
  planId: string,
  couponCode?: string
): Promise<{
  planName: string;
  durationDays: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  couponApplied?: string;
  error?: string;
}> {
  const plan = await prisma.membershipPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    return {
      planName: '',
      durationDays: 0,
      originalPrice: 0,
      discountAmount: 0,
      finalPrice: 0,
      error: 'Plan not found.',
    };
  }

  const originalPrice = Number(plan.price);
  let discountAmount = 0;
  let couponApplied: string | undefined = undefined;

  if (couponCode) {
    const couponResult = await validateCouponServer(couponCode, originalPrice);
    if (couponResult.valid) {
      discountAmount = couponResult.discountAmount;
      couponApplied = couponResult.code;
    }
  }

  return {
    planName: plan.name,
    durationDays: plan.durationDays,
    originalPrice,
    discountAmount,
    finalPrice: Math.max(0, originalPrice - discountAmount),
    couponApplied,
  };
}

// ==========================================
// MEMBERSHIP RENEWAL & ACTIVATION ENGINE
// ==========================================

export async function renewMembershipAction({
  planId,
  couponCode,
  paymentMethod = PaymentMethod.UPI,
  notes,
}: {
  planId: string;
  couponCode?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}) {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      profile: {
        include: {
          memberships: {
            orderBy: { endDate: 'desc' },
            take: 1,
            include: { plan: true },
          },
        },
      },
    },
  });

  if (!user || !user.profile) {
    return { success: false, error: 'Member profile not found.' };
  }

  const currentMembership = user.profile.memberships[0];

  // Server-side price calculation
  const priceResult = await calculatePlanPriceServer(planId, couponCode);
  if (priceResult.error) {
    return { success: false, error: priceResult.error };
  }

  const plan = await prisma.membershipPlan.findUnique({
    where: { id: planId },
  });
  if (!plan) return { success: false, error: 'Invalid plan selected' };

  const now = new Date();

  // CRITICAL BUSINESS LOGIC: PRESERVE REMAINING DAYS
  let startDate = now;
  let previousEndDate = now;
  if (currentMembership && currentMembership.endDate > now && currentMembership.status === MembershipStatus.ACTIVE) {
    // Early renewal starts from existing expiration date!
    startDate = new Date(currentMembership.endDate);
    previousEndDate = new Date(currentMembership.endDate);
  }

  const newEndDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
  const receiptNumber = generateReceiptNumber();

  // Execute renewal in atomic database transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create new active membership
    const newMembership = await tx.membership.create({
      data: {
        memberId: user.profile!.id,
        planId: plan.id,
        startDate: startDate,
        endDate: newEndDate,
        status: MembershipStatus.ACTIVE,
        agreedPrice: priceResult.finalPrice,
        notes: notes || 'Member portal renewal',
      },
    });

    // 2. Create Payment record
    const payment = await tx.payment.create({
      data: {
        memberId: user.profile!.id,
        membershipId: newMembership.id,
        amount: priceResult.finalPrice,
        currency: 'INR',
        method: paymentMethod,
        status: PaymentStatus.COMPLETED,
        transactionRef: `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        receiptNumber,
        verifiedAt: now,
        notes: `Renewal payment for ${plan.name}`,
      },
    });

    // 3. Record MembershipRenewal link if there was a previous membership
    if (currentMembership) {
      await tx.membershipRenewal.create({
        data: {
          oldMembershipId: currentMembership.id,
          newMembershipId: newMembership.id,
          memberId: user.profile!.id,
          previousEndDate: previousEndDate,
          newEndDate: newEndDate,
          renewalPrice: priceResult.finalPrice,
          paymentId: payment.id,
        },
      });

      // 4. SUPPRESS / CANCEL obsolete pending reminders for the old membership!
      await tx.emailReminder.updateMany({
        where: {
          membershipId: currentMembership.id,
          status: ReminderStatus.PENDING,
        },
        data: {
          status: ReminderStatus.CANCELLED,
        },
      });
    }

    // 5. Track coupon redemption if applied
    if (priceResult.couponApplied) {
      const offer = await tx.offer.findUnique({
        where: { code: priceResult.couponApplied },
      });
      if (offer) {
        await tx.couponRedemption.create({
          data: {
            offerId: offer.id,
            memberId: user.profile!.id,
            paymentId: payment.id,
            discountApplied: priceResult.discountAmount,
          },
        });
        await tx.offer.update({
          where: { id: offer.id },
          data: { timesUsed: { increment: 1 } },
        });
      }
    }

    return { newMembership, payment };
  });

  // Dispatch Confirmation Email asynchronously
  sendRenewalConfirmationEmail({
    userEmail: user.email,
    userName: user.name,
    planName: plan.name,
    newEndDate: newEndDate,
    amountPaid: priceResult.finalPrice,
    receiptNumber,
  }).catch((e) => console.error('Failed to dispatch renewal confirmation email:', e));

  safeRevalidate('/member');
  safeRevalidate('/admin');
  return { success: true, receiptNumber, newEndDate };
}

// ==========================================
// ADMIN: MEMBER MANAGEMENT ACTIONS
// ==========================================

export async function adminCreateMemberAction(formData: FormData) {
  await requireAdmin();

  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const phone = (formData.get('phone') as string)?.trim();
  const planId = formData.get('planId') as string;
  const paymentMethod = (formData.get('paymentMethod') as PaymentMethod) || PaymentMethod.CASH;
  const emergencyContact = (formData.get('emergencyContact') as string)?.trim();
  const emergencyPhone = (formData.get('emergencyPhone') as string)?.trim();

  if (!name || !email || !planId) {
    return { success: false, error: 'Name, email, and plan are required.' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'A user with this email already exists.' };
  }

  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) return { success: false, error: 'Invalid plan selected.' };

  const memberCount = await prisma.memberProfile.count();
  const membershipNumber = generateMembershipNumber(memberCount + 1);
  const passwordHash = await hashPassword('Member@123'); // Default initial password

  const now = new Date();
  const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
  const receiptNumber = generateReceiptNumber();

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: Role.MEMBER,
        emailVerified: now,
        profile: {
          create: {
            membershipNumber,
            emergencyContact,
            emergencyPhone,
          },
        },
      },
      include: { profile: true },
    });

    const membership = await tx.membership.create({
      data: {
        memberId: user.profile!.id,
        planId: plan.id,
        startDate: now,
        endDate: endDate,
        status: MembershipStatus.ACTIVE,
        agreedPrice: plan.price,
        notes: 'Created by Admin concierge desk',
      },
    });

    await tx.payment.create({
      data: {
        memberId: user.profile!.id,
        membershipId: membership.id,
        amount: plan.price,
        currency: 'INR',
        method: paymentMethod,
        status: PaymentStatus.COMPLETED,
        transactionRef: `ADM-CASH-${Date.now()}`,
        receiptNumber,
        verifiedAt: now,
        notes: `Recorded at front desk by Administrator`,
      },
    });
  });

  safeRevalidate('/admin/members');
  return { success: true };
}

export async function adminUpdateMemberAction(memberProfileId: string, formData: FormData) {
  await requireAdmin();

  const name = (formData.get('name') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const emergencyContact = (formData.get('emergencyContact') as string)?.trim();
  const emergencyPhone = (formData.get('emergencyPhone') as string)?.trim();
  const address = (formData.get('address') as string)?.trim();
  const medicalNotes = (formData.get('medicalNotes') as string)?.trim();

  const profile = await prisma.memberProfile.findUnique({
    where: { id: memberProfileId },
    include: { user: true },
  });

  if (!profile) return { success: false, error: 'Member not found.' };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: profile.userId },
      data: { name, phone },
    }),
    prisma.memberProfile.update({
      where: { id: memberProfileId },
      data: { emergencyContact, emergencyPhone, address, medicalNotes },
    }),
  ]);

  safeRevalidate('/admin/members');
  return { success: true };
}

// ==========================================
// ADMIN: MEMBERSHIP PLAN ACTIONS
// ==========================================

export async function adminSavePlanAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get('id') as string | null;
  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim().toLowerCase();
  const description = (formData.get('description') as string)?.trim();
  const price = parseFloat(formData.get('price') as string);
  const durationDays = parseInt(formData.get('durationDays') as string, 10);
  const ptSessionsIncluded = parseInt((formData.get('ptSessionsIncluded') as string) || '0', 10);
  const isPopular = formData.get('isPopular') === 'true';
  const isPublished = formData.get('isPublished') === 'true';
  const featuresRaw = formData.get('features') as string;

  const features = JSON.stringify(
    featuresRaw
      ? featuresRaw
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean)
      : []
  );

  if (!name || !slug || isNaN(price) || isNaN(durationDays)) {
    return { success: false, error: 'Name, slug, price, and duration are required.' };
  }

  if (id) {
    await prisma.membershipPlan.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price,
        durationDays,
        ptSessionsIncluded,
        isPopular,
        isPublished,
        features,
      },
    });
  } else {
    await prisma.membershipPlan.create({
      data: {
        name,
        slug,
        description,
        price,
        durationDays,
        ptSessionsIncluded,
        isPopular,
        isPublished,
        features,
      },
    });
  }

  safeRevalidate('/admin/plans');
  safeRevalidate('/membership');
  safeRevalidate('/');
  return { success: true };
}

export async function adminTogglePlanStatusAction(planId: string, isPublished: boolean) {
  await requireAdmin();
  await prisma.membershipPlan.update({
    where: { id: planId },
    data: { isPublished },
  });
  safeRevalidate('/admin/plans');
  safeRevalidate('/membership');
  return { success: true };
}

// ==========================================
// ADMIN: TRAINER ACTIONS
// ==========================================

export async function adminSaveTrainerAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get('id') as string | null;
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const phone = (formData.get('phone') as string)?.trim();
  const bio = (formData.get('bio') as string)?.trim();
  const specialties = (formData.get('specialties') as string)?.trim();
  const experienceYears = parseInt((formData.get('experienceYears') as string) || '1', 10);
  const hourlyRate = parseFloat(formData.get('hourlyRate') as string);
  const photoUrl = (formData.get('photoUrl') as string)?.trim();
  const isPublished = formData.get('isPublished') === 'true';

  if (!name || !email || !bio) {
    return { success: false, error: 'Name, email, and bio are required.' };
  }

  if (id) {
    await prisma.trainer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        bio,
        specialties,
        experienceYears,
        hourlyRate,
        photoUrl,
        isPublished,
      },
    });
  } else {
    const trainer = await prisma.trainer.create({
      data: {
        name,
        email,
        phone,
        bio,
        specialties,
        experienceYears,
        hourlyRate,
        photoUrl,
        isPublished,
      },
    });

    // Seed default availability Mon-Sat
    for (let day = 1; day <= 6; day++) {
      await prisma.trainerAvailability.create({
        data: {
          trainerId: trainer.id,
          dayOfWeek: day,
          startTime: '06:00',
          endTime: '20:00',
          slotDurationMinutes: 60,
          isAvailable: true,
        },
      });
    }
  }

  safeRevalidate('/admin/trainers');
  safeRevalidate('/trainers');
  return { success: true };
}

// ==========================================
// TRAINER BOOKING WITH CONFLICT PREVENTION
// ==========================================

export async function bookTrainerSessionAction({
  trainerId,
  bookingDate,
  startTime,
  endTime,
  notes,
}: {
  trainerId: string;
  bookingDate: string; // ISO date string "YYYY-MM-DD"
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  notes?: string;
}) {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      profile: {
        include: {
          memberships: {
            where: { status: MembershipStatus.ACTIVE },
            take: 1,
          },
        },
      },
    },
  });

  if (!user || !user.profile) {
    return { success: false, error: 'Member profile not found.' };
  }

  if (user.profile.memberships.length === 0) {
    return { success: false, error: 'An active membership is required to book coaching sessions.' };
  }

  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId },
  });
  if (!trainer || !trainer.isActive) {
    return { success: false, error: 'Trainer is not currently active.' };
  }

  const parsedDate = new Date(bookingDate);
  parsedDate.setHours(0, 0, 0, 0);

  // STRICT OVERLAP PREVENTION
  // Check if trainer already has a booking that overlaps with requested time
  const conflict = await prisma.trainerBooking.findFirst({
    where: {
      trainerId,
      bookingDate: parsedDate,
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      OR: [
        {
          AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
        },
        {
          AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
        },
      ],
    },
  });

  if (conflict) {
    return {
      success: false,
      error: `Coach ${trainer.name} already has a confirmed session at this time. Please select another slot.`,
    };
  }

  const booking = await prisma.trainerBooking.create({
    data: {
      trainerId,
      memberId: user.profile.id,
      bookingDate: parsedDate,
      startTime,
      endTime,
      status: BookingStatus.CONFIRMED,
      notes,
    },
  });

  // Dispatch booking confirmation email
  sendBookingConfirmationEmail({
    userEmail: user.email,
    userName: user.name,
    trainerName: trainer.name,
    bookingDate: parsedDate,
    timeSlot: `${startTime} - ${endTime}`,
  }).catch((e) => console.error('Booking email error:', e));

  safeRevalidate('/member/bookings');
  safeRevalidate('/admin/bookings');
  return { success: true, bookingId: booking.id };
}

export async function adminUpdateBookingStatusAction(bookingId: string, status: BookingStatus) {
  await requireAdmin();
  await prisma.trainerBooking.update({
    where: { id: bookingId },
    data: { status },
  });
  safeRevalidate('/admin/bookings');
  safeRevalidate('/member/bookings');
  return { success: true };
}

// ==========================================
// ATTENDANCE & QR CHECK-IN WITH SAFEGUARDS
// ==========================================

export async function processAttendanceCheckInAction(memberIdentifier: string) {
  // memberIdentifier can be membershipNumber ("FL-2026-0001") or memberProfileId
  const member = await prisma.memberProfile.findFirst({
    where: {
      OR: [{ id: memberIdentifier }, { membershipNumber: memberIdentifier }],
    },
    include: {
      user: true,
      memberships: {
        where: {
          status: { in: [MembershipStatus.ACTIVE, MembershipStatus.EXPIRING_SOON] },
        },
        orderBy: { endDate: 'desc' },
        take: 1,
      },
    },
  });

  if (!member) {
    return { success: false, error: 'Member not found with this membership identifier.' };
  }

  const now = new Date();

  // Verify Active Membership
  if (!member.memberships || member.memberships.length === 0 || member.memberships[0].endDate < now) {
    return {
      success: false,
      error: `Entry Denied: Membership for ${member.user.name} is EXPIRED. Please renew at the concierge.`,
      status: 'EXPIRED',
    };
  }

  // Prevent Duplicate Check-In within 2 hours
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const recentCheckIn = await prisma.attendance.findFirst({
    where: {
      memberId: member.id,
      checkInTime: { gte: twoHoursAgo },
    },
  });

  if (recentCheckIn) {
    return {
      success: false,
      error: `Duplicate Check-In: ${member.user.name} has already checked in recently at ${recentCheckIn.checkInTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`,
      alreadyCheckedIn: true,
    };
  }

  const attendance = await prisma.attendance.create({
    data: {
      memberId: member.id,
      checkInTime: now,
      method: AttendanceMethod.QR_CODE,
      verifiedBy: 'Turnstile QR Scanner',
    },
  });

  safeRevalidate('/admin/attendance');
  return {
    success: true,
    memberName: member.user.name,
    membershipNumber: member.membershipNumber,
    checkInTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    daysRemaining: Math.ceil((member.memberships[0].endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  };
}

// ==========================================
// OFFERS & COUPONS MANAGEMENT
// ==========================================

export async function adminSaveOfferAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get('id') as string | null;
  const title = (formData.get('title') as string)?.trim();
  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const description = (formData.get('description') as string)?.trim();
  const discountType = (formData.get('discountType') as DiscountType) || DiscountType.PERCENTAGE;
  const discountValue = parseFloat(formData.get('discountValue') as string);
  const minOrderAmount = parseFloat((formData.get('minOrderAmount') as string) || '0');
  const maxDiscountAmount = formData.get('maxDiscountAmount')
    ? parseFloat(formData.get('maxDiscountAmount') as string)
    : null;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const usageLimit = formData.get('usageLimit') ? parseInt(formData.get('usageLimit') as string, 10) : null;
  const isActive = formData.get('isActive') === 'true';
  const isPublic = formData.get('isPublic') === 'true';

  if (!title || !code || isNaN(discountValue)) {
    return { success: false, error: 'Title, code, and discount value are required.' };
  }

  if (id) {
    await prisma.offer.update({
      where: { id },
      data: {
        title,
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        startDate,
        endDate,
        usageLimit,
        isActive,
        isPublic,
      },
    });
  } else {
    await prisma.offer.create({
      data: {
        title,
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        startDate,
        endDate,
        usageLimit,
        isActive,
        isPublic,
      },
    });
  }

  safeRevalidate('/admin/offers');
  safeRevalidate('/offers');
  return { success: true };
}

// ==========================================
// GYM SETTINGS ACTIONS
// ==========================================

export async function adminUpdateGymSettingsAction(formData: FormData) {
  await requireAdmin();

  const gymName = (formData.get('gymName') as string)?.trim();
  const contactEmail = (formData.get('contactEmail') as string)?.trim();
  const contactPhone = (formData.get('contactPhone') as string)?.trim();
  const address = (formData.get('address') as string)?.trim();
  const openingHours = (formData.get('openingHours') as string)?.trim();
  const timezone = (formData.get('timezone') as string)?.trim() || 'Asia/Kolkata';
  const reminderLeadDays = (formData.get('reminderLeadDays') as string)?.trim() || '[7,3,1,0]';
  const allowOnlinePayments = formData.get('allowOnlinePayments') === 'true';

  await prisma.gymSettings.upsert({
    where: { id: 'default-settings' },
    update: {
      gymName,
      contactEmail,
      contactPhone,
      address,
      openingHours,
      timezone,
      reminderLeadDays,
      allowOnlinePayments,
    },
    create: {
      id: 'default-settings',
      gymName,
      contactEmail,
      contactPhone,
      address,
      openingHours,
      timezone,
      reminderLeadDays,
      allowOnlinePayments,
    },
  });

  safeRevalidate('/admin/settings');
  safeRevalidate('/');
  return { success: true };
}

// ==========================================
// EMAIL RETRY ACTION
// ==========================================

export async function adminRetryFailedEmailAction(reminderId: string) {
  await requireAdmin();

  const reminder = await prisma.emailReminder.findUnique({
    where: { id: reminderId },
    include: {
      membership: {
        include: {
          plan: true,
          member: { include: { user: true } },
        },
      },
    },
  });

  if (!reminder) return { success: false, error: 'Reminder record not found.' };

  const member = reminder.membership.member.user;
  const plan = reminder.membership.plan;

  const content = {
    subject: `FITLIFE Membership Notice - Retry Dispatch`,
    html: `<p>Reminder for ${plan.name} expiring on ${reminder.membership.endDate.toLocaleDateString()}.</p>`,
  };

  const sendResult = await sendEmail({
    to: reminder.memberEmail,
    subject: content.subject,
    templateType: `RETRY_${reminder.reminderType}`,
    html: content.html,
  });

  if (sendResult.success) {
    await prisma.emailReminder.update({
      where: { id: reminderId },
      data: {
        status: ReminderStatus.SENT,
        providerMessageId: sendResult.messageId,
        sentAt: new Date(),
        lastError: null,
        attemptCount: { increment: 1 },
      },
    });
    safeRevalidate('/admin/emails');
    return { success: true };
  } else {
    await prisma.emailReminder.update({
      where: { id: reminderId },
      data: {
        status: ReminderStatus.FAILED,
        lastError: sendResult.error,
        attemptCount: { increment: 1 },
      },
    });
    safeRevalidate('/admin/emails');
    return { success: false, error: sendResult.error };
  }
}

// ==========================================
// FITNESS PROGRESS LOGGER
// ==========================================

export async function logFitnessProgressAction(formData: FormData) {
  const session = await requireAuth();

  const weightKg = parseFloat(formData.get('weightKg') as string);
  const bodyFatPercentage = formData.get('bodyFatPercentage')
    ? parseFloat(formData.get('bodyFatPercentage') as string)
    : null;
  const chestCm = formData.get('chestCm') ? parseFloat(formData.get('chestCm') as string) : null;
  const waistCm = formData.get('waistCm') ? parseFloat(formData.get('waistCm') as string) : null;
  const notes = (formData.get('notes') as string)?.trim();

  if (isNaN(weightKg)) {
    return { success: false, error: 'Weight in kg is required.' };
  }

  const profile = await prisma.memberProfile.findUnique({
    where: { userId: session.id },
  });

  if (!profile) return { success: false, error: 'Profile not found.' };

  await prisma.fitnessProgressRecord.create({
    data: {
      memberId: profile.id,
      recordDate: new Date(),
      weightKg,
      bodyFatPercentage,
      chestCm,
      waistCm,
      notes,
    },
  });

  safeRevalidate('/member/progress');
  return { success: true };
}
