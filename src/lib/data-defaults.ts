export const DEFAULT_PLANS = [
  {
    id: 'default-gold',
    name: 'Gold Performance',
    slug: 'gold-performance',
    description: 'Essential luxury athletic floor access with Finnish saunas and Eleiko rigs.',
    price: 4999 as unknown as any,
    durationDays: 30,
    durationType: 'MONTHLY' as any,
    features: JSON.stringify([
      'Full athletic floor access 24/7',
      'Eleiko Olympic rigs & calibrated plates',
      'Finnish dry cedar sauna suites',
      'Luxury grooming suites with Dyson appliances',
      '2 Complimentary coach assessments',
    ]),
    ptSessionsIncluded: 2,
    isPopular: false,
    isPublished: true,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-platinum',
    name: 'Platinum Elite',
    slug: 'platinum-elite',
    description: 'Our premier all-inclusive tier with cold plunge contrast therapy and personal coaching.',
    price: 9999 as unknown as any,
    durationDays: 90,
    durationType: 'QUARTERLY' as any,
    features: JSON.stringify([
      'All Gold privileges included',
      'Sub-zero 4°C cold hydrotherapy tubs',
      '6 Private 1-on-1 coaching sessions included',
      'Complimentary garment laundry & towel service',
      'Biometric priority lane turnstiles',
    ]),
    ptSessionsIncluded: 6,
    isPopular: true,
    isPublished: true,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-diamond',
    name: 'Black Diamond VIP',
    slug: 'black-diamond-vip',
    description: 'Unrestricted elite privileges, dedicated private locker suite, and master coaching.',
    price: 19999 as unknown as any,
    durationDays: 180,
    durationType: 'BIANNUAL' as any,
    features: JSON.stringify([
      'All Platinum Elite privileges included',
      'Dedicated private VIP locker with RFID entry',
      '15 Master coach sessions included',
      'Bespoke biomarker & nutrition consultation',
      'Unlimited recovery suite passes for guests',
    ]),
    ptSessionsIncluded: 15,
    isPopular: false,
    isPublished: true,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const DEFAULT_TRAINERS = [
  {
    id: 'default-trainer-1',
    name: 'Vikram Malhotra',
    specialties: 'Biomechanics & Hypertrophy',
    bio: 'CSCS certified with 10+ years coaching national powerlifters and executive athletes.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    experienceYears: 10,
    hourlyRate: 2000 as unknown as any,
    isAvailable: true,
    isActive: true,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-trainer-2',
    name: 'Priya Nair',
    specialties: 'Olympic Weightlifting & Mobility',
    bio: 'National Weightlifting champion specializing in clean-and-jerk kinematics and functional recovery.',
    photoUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500&auto=format&fit=crop&q=80',
    experienceYears: 8,
    hourlyRate: 1800 as unknown as any,
    isAvailable: true,
    isActive: true,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-trainer-3',
    name: 'Marcus D\'Souza',
    specialties: 'Rehabilitation & Athletic Conditioning',
    bio: 'Former sports physiotherapist helping members overcome injuries and optimize tendon resilience.',
    photoUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&auto=format&fit=crop&q=80',
    experienceYears: 12,
    hourlyRate: 2500 as unknown as any,
    isAvailable: true,
    isActive: true,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const DEFAULT_OFFERS = [
  {
    id: 'default-offer-1',
    code: 'FITLIFE20',
    title: 'Seasonal Privilege Discount',
    description: 'Receive 20% preferential discount on any Quarterly or Biannual tier.',
    discountType: 'PERCENTAGE' as any,
    discountValue: 20 as unknown as any,
    minOrderAmount: 5000 as unknown as any,
    maxDiscountAmount: 3000 as unknown as any,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    isActive: true,
    isPublic: true,
    timesUsed: 0,
    usageLimit: 500,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-offer-2',
    code: 'WELCOME1000',
    title: 'New Member Welcome Voucher',
    description: 'Flat ₹1,000 instant credit applied at checkout for your first membership plan.',
    discountType: 'FIXED' as any,
    discountValue: 1000 as unknown as any,
    minOrderAmount: 4000 as unknown as any,
    maxDiscountAmount: null,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    isActive: true,
    isPublic: true,
    timesUsed: 0,
    usageLimit: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const DEFAULT_SETTINGS = {
  id: 'default-settings',
  gymName: 'FITLIFE Luxury Athletics',
  contactEmail: 'concierge@fitlife.club',
  contactPhone: '+91 80 4990 8800',
  address: 'Level 4, Signature Towers, Financial District, Bangalore, KA 560103',
  openingHours: 'Mon - Sat: 5:30 AM - 11:00 PM | Sun: 7:00 AM - 8:00 PM',
  upiId: 'fitlife@okhdfcbank',
  gstNumber: '29AAAAA0000A1Z5',
  updatedAt: new Date(),
};

/**
 * Execute a query with a strict timeout so database stalls never delay page rendering.
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 2500, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch {
    clearTimeout(timer!);
    return fallback;
  }
}
