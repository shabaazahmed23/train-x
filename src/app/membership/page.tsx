import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { PricingCalculator } from '@/components/public/PricingCalculator';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Check, Star, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MembershipPage() {
  const session = await getSession();
  const [plans, settings] = await Promise.all([
    prisma.membershipPlan.findMany({
      where: { isPublished: true, isArchived: false },
      orderBy: { price: 'asc' },
    }),
    prisma.gymSettings.findUnique({ where: { id: 'default-settings' } }),
  ]);

  const calculatorPlans = plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    durationDays: p.durationDays,
    durationType: p.durationType,
    ptSessionsIncluded: p.ptSessionsIncluded,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[#111111]">
      <Navbar session={session} />

      <main className="flex-1">
        <section className="py-20 bg-[#141414] border-b border-[#222222]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
              Membership Privileges
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F0] mt-2 mb-4">
              Invest in Your Highest Caliber Self
            </h1>
            <p className="text-base text-[#A0A09B] leading-relaxed">
              Every FITLIFE membership includes access to all athletic zones, luxury lockers, towel service, and our proprietary member portal.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 border-b border-[#222222]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {plans.map((plan) => {
                const features: string[] = plan.features ? JSON.parse(plan.features) : [];
                return (
                  <div
                    key={plan.id}
                    className={`card-luxury flex flex-col justify-between p-6 relative ${
                      plan.isPopular ? 'border-[#C8A96B] ring-1 ring-[#C8A96B]/50' : 'border-[#262626]'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-[#C8A96B] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-black">
                        Recommended
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-bold text-[#F5F5F0]">{plan.name}</h3>
                      <p className="text-xs text-[#8E8E88] mt-1 mb-4 min-h-[36px]">{plan.description}</p>

                      <div className="flex items-baseline gap-1 my-4">
                        <span className="text-3xl font-black text-[#C8A96B]">
                          {formatCurrency(plan.price)}
                        </span>
                        <span className="text-xs text-[#7E7E78]">/ {plan.durationDays} Days</span>
                      </div>

                      <div className="border-t border-[#242424] pt-4 mb-6">
                        <ul className="space-y-2.5 text-xs">
                          {features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2 text-[#D1D1CB]">
                              <Check className="h-3.5 w-3.5 text-[#C8A96B] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                          {plan.ptSessionsIncluded > 0 && (
                            <li className="flex items-start gap-2 text-[#C8A96B] font-semibold">
                              <Star className="h-3.5 w-3.5 shrink-0 mt-0.5 fill-[#C8A96B]" />
                              <span>{plan.ptSessionsIncluded} Coaching Sessions Included</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <Link
                      href={`/register?plan=${plan.slug}`}
                      className={`w-full text-center py-2.5 px-4 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                        plan.isPopular
                          ? 'bg-[#C8A96B] hover:bg-[#DFCA98] text-black'
                          : 'border border-[#383838] hover:border-[#C8A96B] text-[#F5F5F0]'
                      }`}
                    >
                      Join {plan.name}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Custom Calculator */}
            <div className="pt-8">
              <PricingCalculator plans={calculatorPlans} />
            </div>
          </div>
        </section>
      </main>

      <Footer gymInfo={settings} />
    </div>
  );
}
