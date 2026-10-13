import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { RenewalForm } from '@/components/member/RenewalForm';
import { RotateCw, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MemberRenewPage() {
  const session = await requireAuth();

  const [plans, profile] = await Promise.all([
    prisma.membershipPlan.findMany({
      where: { isPublished: true, isArchived: false },
      orderBy: { price: 'asc' },
    }),
    prisma.memberProfile.findUnique({
      where: { userId: session.id },
      include: {
        memberships: {
          orderBy: { endDate: 'desc' },
          take: 1,
          include: { plan: true },
        },
      },
    }),
  ]);

  const currentMembership = profile?.memberships[0];

  const planOptions = plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    durationDays: p.durationDays,
    durationType: p.durationType,
  }));

  const currentMembershipData = currentMembership
    ? {
        id: currentMembership.id,
        endDate: currentMembership.endDate.toISOString(),
        planName: currentMembership.plan.name,
        isActive: currentMembership.status === 'ACTIVE' && currentMembership.endDate > new Date(),
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="border-b border-[#222] pb-6">
        <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
          Membership Continuity
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F0]">Extend & Renew Access</h1>
        <p className="text-xs text-[#8E8E88]">
          Review your renewal options, apply promotional coupons, and extend your gym privileges.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-[#7E7E78]">Loading Renewal Engine...</div>}>
        <RenewalForm
          plans={planOptions}
          currentMembership={currentMembershipData}
        />
      </Suspense>
    </div>
  );
}
