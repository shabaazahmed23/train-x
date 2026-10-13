import { PrismaClient, Role, DurationType, MembershipStatus, PaymentMethod, PaymentStatus, AttendanceMethod, BookingStatus, WorkoutLevel, WorkoutGoal, DiscountType, AnnouncementAudience, ReminderType, ReminderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FITLIFE database seed...');

  // 1. Gym Settings
  const settings = await prisma.gymSettings.upsert({
    where: { id: 'default-settings' },
    update: {
      gymName: 'FITLIFE Luxury Fitness Club',
      contactEmail: 'concierge@fitlife.club',
      contactPhone: '+91 80 4990 8800',
      address: 'Level 4, Signature Towers, Financial District, Bangalore, KA 560103',
      openingHours: 'Mon - Sat: 5:30 AM - 11:00 PM | Sun: 7:00 AM - 8:00 PM',
      currencySymbol: '₹',
      currencyCode: 'INR',
      timezone: 'Asia/Kolkata',
      reminderLeadDays: JSON.stringify([7, 3, 1, 0]),
      allowOnlinePayments: true,
    },
    create: {
      id: 'default-settings',
      gymName: 'FITLIFE Luxury Fitness Club',
      contactEmail: 'concierge@fitlife.club',
      contactPhone: '+91 80 4990 8800',
      address: 'Level 4, Signature Towers, Financial District, Bangalore, KA 560103',
      openingHours: 'Mon - Sat: 5:30 AM - 11:00 PM | Sun: 7:00 AM - 8:00 PM',
      currencySymbol: '₹',
      currencyCode: 'INR',
      timezone: 'Asia/Kolkata',
      reminderLeadDays: JSON.stringify([7, 3, 1, 0]),
      allowOnlinePayments: true,
    },
  });
  console.log('✓ Gym settings configured');

  // 2. Safe Admin Account
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@fitlife.com';
  const adminRawPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@Fitlife2026!';
  const adminPasswordHash = await bcrypt.hash(adminRawPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      name: process.env.ADMIN_DEFAULT_NAME || 'Fitlife General Manager',
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      name: process.env.ADMIN_DEFAULT_NAME || 'Fitlife General Manager',
      phone: '+91 99887 76655',
      emailVerified: new Date(),
    },
  });
  console.log(`✓ Admin user verified: ${adminUser.email}`);

  // Only seed sample demo records if explicitly requested via SEED_DEMO_DATA=true
  if (process.env.SEED_DEMO_DATA !== 'true') {
    console.log('\n🎉 FITLIFE Production Setup Completed Successfully!');
    console.log('--------------------------------------------------');
    console.log(`Administrator Login: ${adminEmail}`);
    console.log(`Administrator Pass:  ${adminRawPassword}`);
    console.log('Database Status: Clean operational state with zero dummy records.');
    console.log('--------------------------------------------------\n');
    return;
  }

  // 3. Membership Plans (Demo Data)
  const plansData = [
    {
      name: 'Silver Fitness',
      slug: 'silver-fitness',
      description: 'Full access to the cardio theatre, Olympic free weights zone, and luxury locker suites.',
      price: 2999,
      durationDays: 30,
      durationType: DurationType.MONTHLY,
      features: JSON.stringify([
        'Access to main fitness floor & cardio arena',
        'Complimentary locker & towel service',
        'Free Wi-Fi & wellness lounge access',
        'FITLIFE mobile app access',
        '1 complimentary fitness assessment',
      ]),
      ptSessionsIncluded: 0,
      isPopular: false,
    },
    {
      name: 'Gold Performance',
      slug: 'gold-performance',
      description: 'Our most popular quarterly package including personal trainer sessions and spa recovery.',
      price: 7999,
      durationDays: 90,
      durationType: DurationType.QUARTERLY,
      features: JSON.stringify([
        'Everything in Silver Fitness',
        '2 complimentary Personal Training sessions',
        'Access to Infrared Sauna & Steam Pavilion',
        'Nutritional guidance and body composition scan',
        'Priority studio class booking',
        '10% guest pass privilege',
      ]),
      ptSessionsIncluded: 2,
      isPopular: true,
    },
    {
      name: 'Platinum Elite',
      slug: 'platinum-elite',
      description: 'Half-yearly comprehensive membership designed for dedicated athletic progression.',
      price: 14499,
      durationDays: 180,
      durationType: DurationType.HALF_YEARLY,
      features: JSON.stringify([
        'Unlimited peak access across all zones',
        '6 one-on-one Personal Training sessions',
        'Customized monthly diet & supplementation plan',
        'Unlimited Infrared Sauna & Cold Plunge access',
        'Complimentary workout laundry service',
        'Dedicated VIP locker',
      ]),
      ptSessionsIncluded: 6,
      isPopular: false,
    },
    {
      name: 'Black Diamond VIP',
      slug: 'black-diamond-vip',
      description: 'The pinnacle of luxury fitness. Complete VIP concierge access, unlimited recovery, and private training.',
      price: 24999,
      durationDays: 365,
      durationType: DurationType.YEARLY,
      features: JSON.stringify([
        'Full annual 365-day all-access membership',
        '15 elite Personal Training sessions with master coaches',
        'Direct 24/7 nutrition & wellness hotline',
        'Private valet parking and reserved VIP locker suite',
        'Full recovery suite: Cryotherapy, Sauna & Hydromassage',
        'Complimentary FITLIFE premium apparel kit',
      ]),
      ptSessionsIncluded: 15,
      isPopular: false,
    },
  ];

  const plans: Record<string, any> = {};
  for (const p of plansData) {
    const plan = await prisma.membershipPlan.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
    plans[p.slug] = plan;
  }
  console.log('✓ Membership plans seeded');

  // 4. Elite Trainers
  const trainersData = [
    {
      name: 'Vikram Malhotra',
      email: 'vikram.m@fitlife.club',
      phone: '+91 98450 11223',
      bio: 'Former national powerlifting champion and certified CSCS strength coach with over 8 years of coaching elite athletes and executives.',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      specialties: 'Olympic Lifting, Hypertrophy, Strength Conditioning',
      experienceYears: 8,
      hourlyRate: 1200,
    },
    {
      name: 'Ananya Sen',
      email: 'ananya.s@fitlife.club',
      phone: '+91 98450 22334',
      bio: 'Rehabilitation specialist and Pilates Master Trainer focused on biomechanical correction, spine mobility, and posture restoration.',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      specialties: 'Pilates, Functional Mobility, Posture Correction, Core',
      experienceYears: 6,
      hourlyRate: 1000,
    },
    {
      name: 'Marcus Vance',
      email: 'marcus.v@fitlife.club',
      phone: '+91 98450 33445',
      bio: 'High-performance coach specializing in rapid body recomposition, metabolic conditioning, and sustainable nutrition habits.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      specialties: 'Body Recomposition, HIIT, Athletic Agility, Nutrition',
      experienceYears: 5,
      hourlyRate: 1100,
    },
    {
      name: 'Priya Sharma',
      email: 'priya.s@fitlife.club',
      phone: '+91 98450 44556',
      bio: 'Certified strength and conditioning specialist with a passion for women’s fitness, prenatal strength, and functional kettlebell training.',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
      specialties: 'Kettlebell Strength, Fat Loss, Endurance, Flexibility',
      experienceYears: 4,
      hourlyRate: 900,
    },
  ];

  const trainers: Record<string, any> = {};
  for (const t of trainersData) {
    const trainer = await prisma.trainer.upsert({
      where: { email: t.email },
      update: t,
      create: t,
    });
    trainers[t.email] = trainer;

    // Create trainer weekly availability (Monday through Saturday)
    for (let day = 1; day <= 6; day++) {
      await prisma.trainerAvailability.upsert({
        where: {
          trainerId_dayOfWeek: {
            trainerId: trainer.id,
            dayOfWeek: day,
          },
        },
        update: {
          startTime: '06:00',
          endTime: '20:00',
          slotDurationMinutes: 60,
          isAvailable: true,
        },
        create: {
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
  console.log('✓ Trainers and schedules seeded');

  // 5. Promotional Offers & Coupons
  const offersData = [
    {
      title: 'Summer Transformation 20% Off',
      code: 'FITLIFE20',
      description: 'Get an instant 20% discount on any quarterly or half-yearly membership plan.',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      minOrderAmount: 5000,
      maxDiscountAmount: 3000,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 100,
      isActive: true,
      isPublic: true,
    },
    {
      title: 'New Member Welcome Voucher',
      code: 'WELCOME1000',
      description: 'Flat ₹1,000 off on your first membership plan purchase.',
      discountType: DiscountType.FIXED,
      discountValue: 1000,
      minOrderAmount: 2999,
      maxDiscountAmount: 1000,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 500,
      isActive: true,
      isPublic: true,
    },
    {
      title: 'VIP Elite Access 15%',
      code: 'ELITE15',
      description: 'Exclusive 15% discount for annual Black Diamond VIP memberships.',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      minOrderAmount: 15000,
      maxDiscountAmount: 4000,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      usageLimit: 50,
      isActive: true,
      isPublic: true,
    },
  ];

  for (const o of offersData) {
    await prisma.offer.upsert({
      where: { code: o.code },
      update: o,
      create: o,
    });
  }
  console.log('✓ Promotional offers seeded');

  // 6. Workout Templates
  const templatesData = [
    {
      title: '3-Day Full Body Foundations',
      description: 'Optimal full-body stimulation 3 days per week, ideal for beginners building functional strength and muscle tone.',
      level: WorkoutLevel.BEGINNER,
      goal: WorkoutGoal.GENERAL_FITNESS,
      daysPerWeek: 3,
      exercises: JSON.stringify([
        { day: 'Day 1', name: 'Goblet Squats', sets: 3, reps: '10-12', rest: 60, notes: 'Focus on depth and upright torso' },
        { day: 'Day 1', name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest: 60, notes: 'Tuck elbows at 45 degrees' },
        { day: 'Day 1', name: 'Lat Pulldowns', sets: 3, reps: '12-15', rest: 60, notes: 'Full lat stretch at the top' },
        { day: 'Day 2', name: 'Romanian Deadlifts', sets: 3, reps: '10', rest: 90, notes: 'Hinge deeply at hips' },
        { day: 'Day 2', name: 'Overhead Dumbbell Press', sets: 3, reps: '10-12', rest: 60, notes: 'Brace core throughout' },
        { day: 'Day 2', name: 'Seated Cable Rows', sets: 3, reps: '12', rest: 60, notes: 'Squeeze shoulder blades' },
        { day: 'Day 3', name: 'Leg Press', sets: 3, reps: '12-15', rest: 60, notes: 'Controlled tempo' },
        { day: 'Day 3', name: 'Push-Ups / Incline Push-Ups', sets: 3, reps: '12-15', rest: 60, notes: 'Maintain solid plank' },
        { day: 'Day 3', name: 'Plank Holds', sets: 3, reps: '45 sec', rest: 45, notes: 'Tight glutes and abdominal wall' },
      ]),
    },
    {
      title: 'Push-Pull-Legs Hypertrophy Protocol',
      description: 'Classic 6-day split maximizing muscular hypertrophy, progressive overload, and joint longevity.',
      level: WorkoutLevel.INTERMEDIATE,
      goal: WorkoutGoal.MUSCLE_GAIN,
      daysPerWeek: 6,
      exercises: JSON.stringify([
        { day: 'Push (Mon/Thu)', name: 'Barbell Incline Bench Press', sets: 4, reps: '8-10', rest: 90, notes: 'Upper chest development' },
        { day: 'Push (Mon/Thu)', name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', rest: 60, notes: 'Strict form, lead with elbows' },
        { day: 'Push (Mon/Thu)', name: 'Cable Tricep Pushdowns', sets: 4, reps: '12-15', rest: 60, notes: 'Lockout with full contraction' },
        { day: 'Pull (Tue/Fri)', name: 'Barbell Bent Over Row', sets: 4, reps: '8-10', rest: 90, notes: 'Explosive pull to navel' },
        { day: 'Pull (Tue/Fri)', name: 'Single-Arm Dumbbell Row', sets: 3, reps: '10-12', rest: 60, notes: 'Keep hips square' },
        { day: 'Pull (Tue/Fri)', name: 'Incline Dumbbell Bicep Curl', sets: 4, reps: '10-12', rest: 60, notes: 'Maximum bicep stretch' },
        { day: 'Legs (Wed/Sat)', name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: 120, notes: 'Hit parallel or below' },
        { day: 'Legs (Wed/Sat)', name: 'Lying Hamstring Curls', sets: 4, reps: '10-12', rest: 60, notes: 'Control the eccentric' },
        { day: 'Legs (Wed/Sat)', name: 'Standing Calf Raises', sets: 4, reps: '15', rest: 45, notes: '2-sec pause at stretch' },
      ]),
    },
  ];

  for (const tmpl of templatesData) {
    const existing = await prisma.workoutTemplate.findFirst({ where: { title: tmpl.title } });
    if (!existing) {
      await prisma.workoutTemplate.create({ data: tmpl });
    }
  }
  console.log('✓ Workout templates seeded');

  // 7. Sample Members (Clearly labelled demo data)
  const memberPasswordHash = await bcrypt.hash('Member@123', 10);
  const now = new Date();

  const membersDemo = [
    {
      email: 'rahul.verma@example.com',
      name: 'Rahul Verma',
      phone: '+91 98111 22334',
      membershipNumber: 'FL-2026-0001',
      planSlug: 'gold-performance',
      startDate: new Date(now.getTime() - 62 * 24 * 60 * 60 * 1000), // 62 days ago
      endDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000), // expires in 28 days
      status: MembershipStatus.ACTIVE,
      emergencyContact: 'Ramesh Verma (Father)',
      emergencyPhone: '+91 98111 22330',
      address: 'Indiranagar 100ft Road, Bangalore',
    },
    {
      email: 'sneha.patel@example.com',
      name: 'Sneha Patel',
      phone: '+91 98222 33445',
      membershipNumber: 'FL-2026-0002',
      planSlug: 'platinum-elite',
      startDate: new Date(now.getTime() - 176 * 24 * 60 * 60 * 1000), // 176 days ago
      endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // expires in 4 days! (Expiring soon)
      status: MembershipStatus.EXPIRING_SOON,
      emergencyContact: 'Deepak Patel (Spouse)',
      emergencyPhone: '+91 98222 33440',
      address: 'Koramangala 4th Block, Bangalore',
    },
    {
      email: 'arjun.mehta@example.com',
      name: 'Arjun Mehta',
      phone: '+91 98333 44556',
      membershipNumber: 'FL-2026-0003',
      planSlug: 'silver-fitness',
      startDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
      endDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // expired 5 days ago!
      status: MembershipStatus.EXPIRED,
      emergencyContact: 'Sunita Mehta (Mother)',
      emergencyPhone: '+91 98333 44550',
      address: 'HSR Layout Sector 2, Bangalore',
    },
    {
      email: 'kavita.rao@example.com',
      name: 'Kavita Rao',
      phone: '+91 98444 55667',
      membershipNumber: 'FL-2026-0004',
      planSlug: 'black-diamond-vip',
      startDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      endDate: new Date(now.getTime() + 345 * 24 * 60 * 60 * 1000), // 345 days remaining
      status: MembershipStatus.ACTIVE,
      emergencyContact: 'Suresh Rao',
      emergencyPhone: '+91 98444 55660',
      address: 'Lavelle Road, Bangalore',
    },
  ];

  for (const m of membersDemo) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {
        name: m.name,
        phone: m.phone,
      },
      create: {
        email: m.email,
        passwordHash: memberPasswordHash,
        name: m.name,
        phone: m.phone,
        role: Role.MEMBER,
        emailVerified: new Date(),
      },
    });

    const profile = await prisma.memberProfile.upsert({
      where: { userId: user.id },
      update: {
        membershipNumber: m.membershipNumber,
        emergencyContact: m.emergencyContact,
        emergencyPhone: m.emergencyPhone,
        address: m.address,
      },
      create: {
        userId: user.id,
        membershipNumber: m.membershipNumber,
        emergencyContact: m.emergencyContact,
        emergencyPhone: m.emergencyPhone,
        address: m.address,
      },
    });

    const plan = plans[m.planSlug];
    if (plan) {
      // Find or create active/current membership
      let membership = await prisma.membership.findFirst({
        where: { memberId: profile.id, planId: plan.id },
      });

      if (!membership) {
        membership = await prisma.membership.create({
          data: {
            memberId: profile.id,
            planId: plan.id,
            startDate: m.startDate,
            endDate: m.endDate,
            status: m.status,
            agreedPrice: plan.price,
            notes: 'Initial enrollment via welcome desk',
          },
        });

        // Record Initial Payment
        const receiptNo = `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        await prisma.payment.create({
          data: {
            memberId: profile.id,
            membershipId: membership.id,
            amount: plan.price,
            currency: 'INR',
            method: PaymentMethod.UPI,
            status: PaymentStatus.COMPLETED,
            transactionRef: `TXN-UPI-${Date.now()}-${profile.id.slice(0, 4)}`,
            receiptNumber: receiptNo,
            verifiedAt: m.startDate,
            notes: 'Verified via UPI Merchant gateway',
            createdAt: m.startDate,
          },
        });

        // Seed check-in attendance records for the last 5 days
        for (let i = 1; i <= 5; i++) {
          const checkIn = new Date(now.getTime() - i * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000); // 7:00 AM
          const checkOut = new Date(checkIn.getTime() + 75 * 60 * 1000); // 75 min workout
          await prisma.attendance.create({
            data: {
              memberId: profile.id,
              checkInTime: checkIn,
              checkOutTime: checkOut,
              method: AttendanceMethod.QR_CODE,
              verifiedBy: 'Self (Turnstile QR Scanner)',
            },
          });
        }

        // Seed fitness progress record
        await prisma.fitnessProgressRecord.create({
          data: {
            memberId: profile.id,
            recordDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            weightKg: 78.5,
            bodyFatPercentage: 18.2,
            chestCm: 102,
            waistCm: 84,
            hipsCm: 98,
            notes: 'Bi-weekly biometric assessment',
          },
        });
        await prisma.fitnessProgressRecord.create({
          data: {
            memberId: profile.id,
            recordDate: now,
            weightKg: 77.2,
            bodyFatPercentage: 17.5,
            chestCm: 103,
            waistCm: 82.5,
            hipsCm: 97.5,
            notes: 'Steady fat loss and shoulder definition improvement',
          },
        });

        // Seed sample workout plan
        const vikram = trainers['vikram.m@fitlife.club'];
        const workoutPlan = await prisma.workoutPlan.create({
          data: {
            memberId: profile.id,
            trainerId: vikram?.id,
            title: 'Custom Hypertrophy & Core Focus',
            description: 'Targeted program designed by Coach Vikram Malhotra for strength gains and lean mass.',
            startDate: now,
            isActive: true,
          },
        });

        await prisma.workoutExercise.createMany({
          data: [
            {
              workoutPlanId: workoutPlan.id,
              dayOfWeek: 'Day 1 - Chest & Triceps',
              exerciseName: 'Incline Dumbbell Press',
              sets: 4,
              reps: '10-12',
              restSeconds: 75,
              instructions: 'Slow 3-second negative descent, explode upwards.',
              orderIndex: 1,
            },
            {
              workoutPlanId: workoutPlan.id,
              dayOfWeek: 'Day 1 - Chest & Triceps',
              exerciseName: 'Cable Crossover Flyes',
              sets: 3,
              reps: '15',
              restSeconds: 60,
              instructions: 'Maintain slight elbow bend and peak squeeze.',
              orderIndex: 2,
            },
            {
              workoutPlanId: workoutPlan.id,
              dayOfWeek: 'Day 2 - Back & Biceps',
              exerciseName: 'Barbell Deadlift',
              sets: 4,
              reps: '6-8',
              restSeconds: 120,
              instructions: 'Reset between every rep, spine neutral.',
              orderIndex: 1,
            },
          ],
        });

        // Seed sample Diet Plan
        await prisma.dietPlan.create({
          data: {
            memberId: profile.id,
            trainerId: vikram?.id,
            title: 'Lean Muscle & Metabolic Recovery Diet',
            dailyCalories: 2400,
            proteinGrams: 170,
            carbsGrams: 250,
            fatGrams: 65,
            meals: JSON.stringify([
              { time: '08:00 AM', name: 'Breakfast', items: '4 Egg whites + 2 whole eggs, 80g rolled oats with blueberries & 10 almonds' },
              { time: '11:30 AM', name: 'Mid-Morning Snack', items: '1 scoop Whey Isolate in cold water + 1 green apple' },
              { time: '01:30 PM', name: 'Lunch', items: '180g Grilled Chicken Breast or Paneer, 1 cup brown rice, large mixed greens bowl' },
              { time: '05:30 PM', name: 'Pre-Workout Fuel', items: '2 slices sourdough toast with peanut butter & black coffee' },
              { time: '08:30 PM', name: 'Dinner', items: '200g Steamed fish or Tofu stir fry with broccoli, bell peppers and quinoa' },
            ]),
          },
        });

        // Seed sample booking for Sneha Patel
        if (m.email === 'sneha.patel@example.com' && vikram) {
          const bookingDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
          await prisma.trainerBooking.create({
            data: {
              trainerId: vikram.id,
              memberId: profile.id,
              bookingDate: bookingDate,
              startTime: '10:00',
              endTime: '11:00',
              status: BookingStatus.CONFIRMED,
              notes: 'Focus on posterior chain and deadlift technique correction.',
            },
          });
        }
      }
    }
  }
  console.log('✓ Sample members, memberships, payments, attendance & plans seeded');

  // 8. Gym Announcements
  const announcementsData = [
    {
      title: 'State-of-the-Art Infrared Saunas Now Open',
      content: 'We are thrilled to unveil our new Scandinavian cedar Infrared Saunas and Cold Plunge suites on Level 4. Available to all Gold, Platinum, and VIP members starting this Monday.',
      targetAudience: AnnouncementAudience.ALL,
      isPublished: true,
    },
    {
      title: 'Special Olympic Lifting Masterclass with Coach Vikram',
      content: 'Join Coach Vikram Malhotra this Saturday at 11:00 AM for an exclusive 90-minute technique clinic covering the Snatch and Clean & Jerk. Limited to 12 participants.',
      targetAudience: AnnouncementAudience.MEMBERS_ONLY,
      isPublished: true,
    },
  ];

  for (const ann of announcementsData) {
    const existing = await prisma.announcement.findFirst({ where: { title: ann.title } });
    if (!existing) {
      await prisma.announcement.create({ data: ann });
    }
  }
  console.log('✓ Announcements seeded');

  // 9. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      adminId: adminUser.id,
      action: 'SYSTEM_INITIALIZED',
      entityType: 'SYSTEM',
      details: 'FITLIFE system seed completed successfully with production configuration.',
    },
  });
  console.log('✓ System audit log registered');

  console.log('\n🎉 FITLIFE Database Seed Completed Successfully!');
  console.log('--------------------------------------------------');
  console.log(`Administrator Login: ${adminEmail}`);
  console.log(`Administrator Pass:  ${adminRawPassword}`);
  console.log('Member Demo 1 (Active):        rahul.verma@example.com (Pass: Member@123)');
  console.log('Member Demo 2 (Expiring Soon): sneha.patel@example.com (Pass: Member@123)');
  console.log('Member Demo 3 (Expired):       arjun.mehta@example.com (Pass: Member@123)');
  console.log('--------------------------------------------------\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
