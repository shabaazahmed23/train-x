import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { ProgressTracker } from '@/components/member/ProgressTracker';

export const dynamic = 'force-dynamic';

export default async function MemberProgressPage() {
  const session = await requireAuth();

  const profile = await prisma.memberProfile.findUnique({
    where: { userId: session.id },
    include: {
      progressRecords: {
        orderBy: { recordDate: 'desc' },
      },
    },
  });

  const records = (profile?.progressRecords || []).map((r) => ({
    id: r.id,
    recordDate: r.recordDate.toISOString(),
    weightKg: Number(r.weightKg),
    bodyFatPercentage: r.bodyFatPercentage ? Number(r.bodyFatPercentage) : null,
    chestCm: r.chestCm ? Number(r.chestCm) : null,
    waistCm: r.waistCm ? Number(r.waistCm) : null,
    notes: r.notes,
  }));

  return (
    <div className="space-y-8">
      <div className="border-b border-[#222] pb-6">
        <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
          Body Composition Telemetry
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F0]">Fitness & Biometric Progress</h1>
        <p className="text-xs text-[#8E8E88]">
          Log your body weight and circumference measurements to track longitudinal recomposition.
        </p>
      </div>

      <ProgressTracker records={records} />
    </div>
  );
}
