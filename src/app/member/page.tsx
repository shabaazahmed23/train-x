import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import {
  formatDate,
  formatCurrency,
  getStatusColor,
  calculateRemainingDays,
} from '@/lib/utils';
import {
  Sparkles,
  RotateCw,
  QrCode,
  Calendar,
  Clock,
  Dumbbell,
  Receipt,
  Utensils,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MemberDashboardPage() {
  const session = await requireAuth();

  const profile = await prisma.memberProfile.findUnique({
    where: { userId: session.id },
    include: {
      user: true,
      memberships: {
        orderBy: { endDate: 'desc' },
        take: 1,
        include: { plan: true },
      },
      bookings: {
        where: { bookingDate: { gte: new Date() } },
        orderBy: { bookingDate: 'asc' },
        take: 2,
        include: { trainer: true },
      },
      attendances: {
        orderBy: { checkInTime: 'desc' },
        take: 5,
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
      workoutPlans: {
        where: { isActive: true },
        take: 1,
        include: { exercises: true, trainer: true },
      },
      dietPlans: {
        where: { isActive: true },
        take: 1,
      },
      progressRecords: {
        orderBy: { recordDate: 'desc' },
        take: 2,
      },
    },
  });

  const membership = profile?.memberships[0];
  const remainingDays = membership ? calculateRemainingDays(membership.endDate) : 0;
  const isExpiringSoon = remainingDays > 0 && remainingDays <= 7;
  const isExpired = !membership || remainingDays <= 0 || membership.status === 'EXPIRED';
  const color = getStatusColor(
    isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING_SOON' : 'ACTIVE'
  );

  const latestProgress = profile?.progressRecords[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
            FITLIFE Athletic Member
          </span>
          <h1 className="text-2xl font-black text-[#F5F5F0]">
            Welcome back, {session.name}
          </h1>
          <p className="text-xs text-[#8E8E88]">
            Pass ID: <span className="font-mono text-[#C8A96B] font-bold">{profile?.membershipNumber}</span> &bull; Bangalore Financial District Pavilion
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/member/attendance"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#333] hover:border-[#C8A96B] bg-[#161616] text-xs font-semibold text-[#F5F5F0] transition-colors"
          >
            <QrCode className="h-3.5 w-3.5 text-[#C8A96B]" />
            <span>Digital QR Pass</span>
          </Link>
          <Link
            href="/member/renew"
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Renew Membership</span>
          </Link>
        </div>
      </div>

      {/* Membership Status Highlight Card */}
      <div className={`card-luxury p-6 relative overflow-hidden ${
        isExpired
          ? 'border-rose-900/60 bg-gradient-to-r from-[#171414] to-[#120F0F]'
          : isExpiringSoon
          ? 'border-amber-900/60 bg-gradient-to-r from-[#171612] to-[#14130F]'
          : 'border-[#C8A96B]/40 bg-gradient-to-r from-[#161616] to-[#131313]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${color.bg} ${color.text} ${color.border}`}>
                {isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING SOON' : 'ACTIVE PASS'}
              </span>
              <span className="text-xs text-[#7E7E78]">
                Tier: <strong className="text-[#F5F5F0]">{membership?.plan.name || 'No Plan Enrolled'}</strong>
              </span>
            </div>

            <h2 className="text-2xl font-black text-[#F5F5F0]">
              {isExpired ? (
                'Your membership requires immediate renewal.'
              ) : isExpiringSoon ? (
                <span>Your membership expires in <span className="text-amber-400 font-mono">{remainingDays} Days</span>!</span>
              ) : (
                <span><span className="text-[#C8A96B] font-mono">{remainingDays} Days</span> remaining of unlimited access</span>
              )}
            </h2>

            <p className="text-xs text-[#A0A09B]">
              {membership ? (
                <>
                  Valid from <strong>{formatDate(membership.startDate)}</strong> through <strong>{formatDate(membership.endDate)}</strong>
                </>
              ) : (
                'Enroll in a membership plan today to unlock gym access and master coaching.'
              )}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/member/renew"
              className="flex items-center justify-center gap-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold text-xs uppercase tracking-wider py-3 px-6 transition-all shadow-md"
            >
              {isExpired ? 'Reactivate Now' : 'Lock In Renewal'} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Trainer Session */}
        <div className="card-luxury p-5 bg-[#161616] border-[#262626] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#8E8E88]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Trainer Appointment</span>
              <Calendar className="h-4 w-4 text-[#C8A96B]" />
            </div>

            {profile?.bookings[0] ? (
              <div className="pt-1">
                <strong className="text-sm text-[#F5F5F0] block">
                  Coach {profile.bookings[0].trainer.name}
                </strong>
                <p className="text-xs text-[#C8A96B] font-mono mt-0.5">
                  {formatDate(profile.bookings[0].bookingDate)} &bull; {profile.bookings[0].startTime} - {profile.bookings[0].endTime}
                </p>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 mt-2 inline-block">
                  Confirmed
                </span>
              </div>
            ) : (
              <div className="pt-2">
                <p className="text-xs text-[#8E8E88]">No appointments booked.</p>
                <span className="text-[11px] text-[#A0A09B] block mt-1">Book 1-on-1 coaching with an Olympic master coach.</span>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[#222]">
            <Link
              href="/member/bookings"
              className="text-xs font-semibold text-[#C8A96B] hover:underline flex items-center gap-1"
            >
              Book Coaching Session &rarr;
            </Link>
          </div>
        </div>

        {/* Workout Plan Summary */}
        <div className="card-luxury p-5 bg-[#161616] border-[#262626] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#8E8E88]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Assigned Workout</span>
              <Dumbbell className="h-4 w-4 text-[#C8A96B]" />
            </div>

            {profile?.workoutPlans[0] ? (
              <div className="pt-1">
                <strong className="text-sm text-[#F5F5F0] block">
                  {profile.workoutPlans[0].title}
                </strong>
                <p className="text-xs text-[#8E8E88] mt-0.5">
                  {profile.workoutPlans[0].exercises.length} prescribed movements
                </p>
                {profile.workoutPlans[0].trainer && (
                  <span className="text-[10px] text-[#C8A96B] block mt-1">
                    Supervised by Coach {profile.workoutPlans[0].trainer.name}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#8E8E88] pt-2">
                No active custom workout routine assigned yet.
              </p>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[#222]">
            <Link
              href="/member/workouts"
              className="text-xs font-semibold text-[#C8A96B] hover:underline flex items-center gap-1"
            >
              View Exercise Breakdown &rarr;
            </Link>
          </div>
        </div>

        {/* Nutritional Plan Summary */}
        <div className="card-luxury p-5 bg-[#161616] border-[#262626] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#8E8E88]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Nutritional Target</span>
              <Utensils className="h-4 w-4 text-[#C8A96B]" />
            </div>

            {profile?.dietPlans[0] ? (
              <div className="pt-1">
                <strong className="text-sm text-[#F5F5F0] block">
                  {profile.dietPlans[0].title}
                </strong>
                <p className="text-xs text-[#C8A96B] font-mono mt-0.5">
                  {profile.dietPlans[0].dailyCalories} kcal/day &bull; {profile.dietPlans[0].proteinGrams}g Protein
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#8E8E88] pt-2">
                No personalized diet protocol assigned yet.
              </p>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[#222]">
            <Link
              href="/member/diet"
              className="text-xs font-semibold text-[#C8A96B] hover:underline flex items-center gap-1"
            >
              View Meal Schedule &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Biometric Progress & Check-ins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Biometrics Progress */}
        <div className="card-luxury p-6 bg-[#161616] border-[#262626] space-y-4">
          <div className="flex items-center justify-between border-b border-[#242424] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#F5F5F0]">Biometrics & Body Composition</h3>
              <p className="text-[11px] text-[#7E7E78]">Latest tracking assessments</p>
            </div>
            <Link
              href="/member/progress"
              className="text-xs font-semibold text-[#C8A96B] hover:underline"
            >
              Log Measurement &rarr;
            </Link>
          </div>

          {latestProgress ? (
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded bg-[#121212] border border-[#242424]">
                <span className="text-[10px] text-[#7E7E78] block">Weight</span>
                <strong className="text-lg font-bold text-[#F5F5F0]">
                  {Number(latestProgress.weightKg)} kg
                </strong>
              </div>
              <div className="p-3 rounded bg-[#121212] border border-[#242424]">
                <span className="text-[10px] text-[#7E7E78] block">Body Fat</span>
                <strong className="text-lg font-bold text-[#C8A96B]">
                  {latestProgress.bodyFatPercentage ? `${Number(latestProgress.bodyFatPercentage)}%` : '—'}
                </strong>
              </div>
              <div className="p-3 rounded bg-[#121212] border border-[#242424]">
                <span className="text-[10px] text-[#7E7E78] block">Assessed On</span>
                <strong className="text-xs text-[#A0A09B] block mt-1">
                  {formatDate(latestProgress.recordDate)}
                </strong>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#8E8E88] py-4 text-center">
              No biometric assessments logged yet. Log your current weight to monitor your progress chart!
            </p>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="card-luxury p-6 bg-[#161616] border-[#262626] space-y-4">
          <div className="flex items-center justify-between border-b border-[#242424] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#F5F5F0]">Recent Turnstile Check-Ins</h3>
              <p className="text-[11px] text-[#7E7E78]">Last 5 facility visits</p>
            </div>
            <Link
              href="/member/attendance"
              className="text-xs font-semibold text-[#C8A96B] hover:underline"
            >
              QR Pass &rarr;
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {profile?.attendances.length === 0 ? (
              <p className="text-xs text-[#7E7E78] text-center py-4">No check-in history yet.</p>
            ) : (
              profile?.attendances.map((att) => (
                <div
                  key={att.id}
                  className="p-2.5 rounded bg-[#121212] border border-[#222] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[#F5F5F0] font-medium">{formatDate(att.checkInTime)}</span>
                  </div>
                  <span className="font-mono text-[#C8A96B] text-[11px]">
                    {new Date(att.checkInTime).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
