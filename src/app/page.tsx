import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { PricingCalculator } from '@/components/public/PricingCalculator';
import { ContactForm } from '@/components/public/ContactForm';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowRight,
  Check,
  Shield,
  Sparkles,
  Award,
  Zap,
  Flame,
  Dumbbell,
  Clock,
  Compass,
  Star,
  ChevronDown,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();

  // Load live data from the database safely with fallbacks
  let plans: Awaited<ReturnType<typeof prisma.membershipPlan.findMany>> = [];
  let trainers: Awaited<ReturnType<typeof prisma.trainer.findMany>> = [];
  let offers: Awaited<ReturnType<typeof prisma.offer.findMany>> = [];
  let settings: Awaited<ReturnType<typeof prisma.gymSettings.findUnique>> = null;

  try {
    const results = await Promise.all([
      prisma.membershipPlan.findMany({
        where: { isPublished: true, isArchived: false },
        orderBy: { price: 'asc' },
      }),
      prisma.trainer.findMany({
        where: { isPublished: true, isActive: true },
        take: 4,
        orderBy: { experienceYears: 'desc' },
      }),
      prisma.offer.findMany({
        where: { isActive: true, isPublic: true },
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.gymSettings.findUnique({
        where: { id: 'default-settings' },
      }),
    ]);
    plans = results[0];
    trainers = results[1];
    offers = results[2];
    settings = results[3];
  } catch (error) {
    console.error('Database connection error in HomePage:', error);
  }

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

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-36 border-b border-[#222222]">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,107,0.12),transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C8A96B]/40 bg-[#C8A96B]/10 px-3.5 py-1 text-xs font-semibold text-[#C8A96B]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Bangalore&apos;s Premier Private Athletic Club</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F5F0] leading-[1.1]">
              Engineered for <span className="gold-gradient-text">Human Performance</span> & Uncompromising Luxury.
            </h1>

            <p className="text-base sm:text-lg text-[#A0A09B] max-w-2xl leading-relaxed">
              Step into an architecturally curated sanctuary featuring Olympic-standard Eleiko equipment, clinical Finnish infrared saunas, bespoke nutrition, and dedicated master coaching.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-[#111111] font-bold text-xs uppercase tracking-wider px-6 py-3.5 transition-all"
              >
                Enroll Membership <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#calculator"
                className="rounded border border-[#333333] hover:border-[#C8A96B]/60 bg-[#171717] text-[#F5F5F0] text-xs font-semibold uppercase tracking-wider px-6 py-3.5 transition-all"
              >
                Price Calculator
              </Link>
              <Link
                href="/trainers"
                className="text-xs font-medium text-[#A0A09B] hover:text-[#C8A96B] transition-colors py-2 px-1"
              >
                Meet Our Master Coaches &rarr;
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[#222222]/80 mt-10">
              <div>
                <span className="text-2xl font-black text-[#F5F5F0]">18,000</span>
                <span className="text-xs text-[#C8A96B] block font-mono">SQ FT FACILITY</span>
              </div>
              <div>
                <span className="text-2xl font-black text-[#F5F5F0]">Eleiko &reg;</span>
                <span className="text-xs text-[#C8A96B] block font-mono">OLYMPIC RIGS</span>
              </div>
              <div>
                <span className="text-2xl font-black text-[#F5F5F0]">4.9 / 5.0</span>
                <span className="text-xs text-[#C8A96B] block font-mono">MEMBER RATING</span>
              </div>
              <div>
                <span className="text-2xl font-black text-[#F5F5F0]">24 / 7</span>
                <span className="text-xs text-[#C8A96B] block font-mono">BIOMETRIC ENTRY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Membership Plans */}
      <section className="py-24 bg-[#141414] border-b border-[#222222]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
              Membership Tiers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F5F0]">
              Transparent Membership Architecture
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A09B]">
              Select from all-inclusive monthly, quarterly, or annual privileges. No hidden registration fees or lock-in penalties.
            </p>
          </div>

          {plans.length === 0 ? (
            <div className="card-luxury p-12 text-center border-dashed border-[#2A2A2A] bg-[#161616]/60 max-w-xl mx-auto space-y-3">
              <span className="text-xs uppercase font-mono tracking-widest text-[#C8A96B]">Tiers Updating</span>
              <h3 className="text-lg font-bold text-[#F5F5F0]">No Membership Plans Published Yet</h3>
              <p className="text-xs text-[#8E8E88] leading-relaxed">
                Our team is currently finalizing upcoming membership tiers and seasonal packages. Please visit our reception desk or contact our concierge directly.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Contact Concierge Desk &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        Most Popular
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-bold text-[#F5F5F0]">{plan.name}</h3>
                      <p className="text-xs text-[#8E8E88] mt-1 mb-4 min-h-[32px]">{plan.description}</p>

                      <div className="flex items-baseline gap-1 my-4">
                        <span className="text-3xl font-black text-[#C8A96B]">
                          {formatCurrency(plan.price)}
                        </span>
                        <span className="text-xs text-[#7E7E78]">/ {plan.durationDays} Days</span>
                      </div>

                      <div className="border-t border-[#242424] pt-4 mb-6">
                        <span className="text-[11px] font-semibold text-[#A0A09B] uppercase tracking-wider block mb-2.5">
                          Privileges Included:
                        </span>
                        <ul className="space-y-2 text-xs">
                          {features.slice(0, 5).map((feat, i) => (
                            <li key={i} className="flex items-start gap-2 text-[#D1D1CB]">
                              <Check className="h-3.5 w-3.5 text-[#C8A96B] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                          {plan.ptSessionsIncluded > 0 && (
                            <li className="flex items-start gap-2 text-[#C8A96B] font-medium">
                              <Star className="h-3.5 w-3.5 shrink-0 mt-0.5 fill-[#C8A96B]" />
                              <span>{plan.ptSessionsIncluded} Private PT Sessions Included</span>
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
                      Select {plan.name}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Price Calculator Section */}
      <section id="calculator" className="py-24 bg-[#111111] border-b border-[#222222]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
              Real-Time Estimator
            </span>
            <h2 className="text-3xl font-extrabold text-[#F5F5F0]">
              Calculate Your Custom Membership Investment
            </h2>
          </div>

          <PricingCalculator plans={calculatorPlans} />
        </div>
      </section>

      {/* Master Coaches Section */}
      <section className="py-24 bg-[#141414] border-b border-[#222222]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
                Faculty of Coaches
              </span>
              <h2 className="text-3xl font-extrabold text-[#F5F5F0]">
                Coached by National Champions & Biomechanics Specialists
              </h2>
            </div>
            <Link
              href="/trainers"
              className="text-xs font-semibold uppercase tracking-wider text-[#C8A96B] hover:underline flex items-center gap-1.5"
            >
              View Full Trainer Roster <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="card-luxury overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-64 w-full bg-[#1F1F1F]">
                    {trainer.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={trainer.photoUrl}
                        alt={trainer.name}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#7E7E78]">
                        <Dumbbell className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-mono text-[#C8A96B] border border-[#C8A96B]/30">
                      {trainer.experienceYears}+ Years Exp
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-[#F5F5F0]">{trainer.name}</h3>
                    <p className="text-xs font-medium text-[#C8A96B] mt-0.5 mb-2.5">
                      {trainer.specialties}
                    </p>
                    <p className="text-xs text-[#8E8E88] line-clamp-3 leading-relaxed">
                      {trainer.bio}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-[#222222] mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#A0A09B]">
                    Rate: <strong className="text-[#F5F5F0]">{formatCurrency(trainer.hourlyRate)}</strong>/hr
                  </span>
                  <Link
                    href={`/member/bookings?trainerId=${trainer.id}`}
                    className="text-xs font-semibold text-[#C8A96B] hover:underline"
                  >
                    Book Session
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Luxury Amenities & Facilities */}
      <section className="py-24 bg-[#111111] border-b border-[#222222]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
              World-Class Facilities
            </span>
            <h2 className="text-3xl font-extrabold text-[#F5F5F0]">
              Every Detail Tailored for Performance & Recovery
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-luxury p-6 space-y-3 border-[#282828]">
              <div className="h-10 w-10 rounded bg-[#C8A96B]/10 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B]">
                <Dumbbell className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F0]">Olympic Free Weights & Eleiko Rigs</h3>
              <p className="text-xs text-[#8E8E88] leading-relaxed">
                Calibration-accurate competition barbells, calibrated steel discs, sound-dampening drop platforms, and custom dumbbells up to 60 kg.
              </p>
            </div>

            <div className="card-luxury p-6 space-y-3 border-[#282828]">
              <div className="h-10 w-10 rounded bg-[#C8A96B]/10 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B]">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F0]">Infrared Saunas & Cold Hydrotherapy</h3>
              <p className="text-xs text-[#8E8E88] leading-relaxed">
                Dedicated Scandinavian cedar heat suites operating at 75°C paired with 4°C sub-zero cold plunge tubs for rapid metabolic reduction and nervous recovery.
              </p>
            </div>

            <div className="card-luxury p-6 space-y-3 border-[#282828]">
              <div className="h-10 w-10 rounded bg-[#C8A96B]/10 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B]">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F0]">Biometric QR Turnstiles & Private Lockers</h3>
              <p className="text-xs text-[#8E8E88] leading-relaxed">
                Seamless digital check-ins with RFID-coded luxury locker suites, rainfall showers, Dyson grooming appliances, and complimentary garment laundry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Offers Banner */}
      {offers.length > 0 && (
        <section className="py-16 bg-[#161616] border-b border-[#222222]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
                  Exclusive Privileges
                </span>
                <h3 className="text-2xl font-bold text-[#F5F5F0]">Current Seasonal Offers & Coupons</h3>
              </div>
              <Link href="/offers" className="text-xs text-[#C8A96B] font-semibold hover:underline">
                View All Promotional Vouchers &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="p-5 rounded border border-[#C8A96B]/30 bg-[#1A1A1A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#C8A96B] bg-[#C8A96B]/15 px-2.5 py-1 rounded border border-[#C8A96B]/40">
                      {offer.code}
                    </span>
                    <span className="text-[10px] text-[#7E7E78]">
                      Expires {new Date(offer.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#F5F5F0]">{offer.title}</h4>
                  <p className="text-xs text-[#8E8E88]">{offer.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Club Standards & Philosophy */}
      <section className="py-24 bg-[#141414] border-b border-[#222222]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
              The FITLIFE Standard
            </span>
            <h2 className="text-3xl font-extrabold text-[#F5F5F0]">
              Built for Serious Transformation
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A09B]">
              A luxury training floor engineered around precision biomechanics, recovery science, and dignified hospitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-luxury p-6 space-y-4 border-[#262626]">
              <div className="text-[#C8A96B] font-mono text-xs uppercase tracking-wider">
                01 / Equipment Integrity
              </div>
              <h3 className="text-base font-bold text-[#F5F5F0]">Calibration-Certified Rigs & Barbells</h3>
              <p className="text-xs text-[#8E8E88] leading-relaxed">
                Every barbell, disc, and rack on our floor conforms to international powerlifting and weightlifting specifications. Sound-isolated drop platforms protect your joints and focus.
              </p>
            </div>

            <div className="card-luxury p-6 space-y-4 border-[#262626]">
              <div className="text-[#C8A96B] font-mono text-xs uppercase tracking-wider">
                02 / Athletic Recovery
              </div>
              <h3 className="text-base font-bold text-[#F5F5F0]">Thermal Suites & Contrast Therapy</h3>
              <p className="text-xs text-[#8E8E88] leading-relaxed">
                Finnish cedar dry saunas, infrared thermal benches, and 4°C chilled hydrotherapy baths support accelerated nervous recovery and reduced delayed onset muscle soreness.
              </p>
            </div>

            <div className="card-luxury p-6 space-y-4 border-[#262626]">
              <div className="text-[#C8A96B] font-mono text-xs uppercase tracking-wider">
                03 / Digital Autonomy
              </div>
              <h3 className="text-base font-bold text-[#F5F5F0]">Frictionless Member Portal</h3>
              <p className="text-xs text-[#8E8E88] leading-relaxed">
                Manage your membership with full independence: instant QR turnstile scans, transparent renewal schedules, coach booking calendars, and digital invoice generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[#111111] border-b border-[#222222]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
              Common Inquiries
            </span>
            <h2 className="text-3xl font-extrabold text-[#F5F5F0]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            <details className="group card-luxury p-5 open:border-[#C8A96B]/50 transition-colors cursor-pointer">
              <summary className="flex items-center justify-between text-sm font-semibold text-[#F5F5F0] list-none">
                <span>What are the gym operating hours and entry guidelines?</span>
                <ChevronDown className="h-4 w-4 text-[#A0A09B] transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-xs text-[#8E8E88] leading-relaxed">
                FITLIFE is open Monday through Saturday from 5:30 AM to 11:00 PM, and Sundays from 7:00 AM to 8:00 PM. Members scan their personalized QR code at the turnstile for instant validation.
              </p>
            </details>

            <details className="group card-luxury p-5 open:border-[#C8A96B]/50 transition-colors cursor-pointer">
              <summary className="flex items-center justify-between text-sm font-semibold text-[#F5F5F0] list-none">
                <span>How does early renewal work? Will I lose my remaining days?</span>
                <ChevronDown className="h-4 w-4 text-[#A0A09B] transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-xs text-[#8E8E88] leading-relaxed">
                No. Our system preserves all remaining days. If your current membership expires on the 30th and you renew on the 15th, your new membership duration is automatically appended to the 30th.
              </p>
            </details>

            <details className="group card-luxury p-5 open:border-[#C8A96B]/50 transition-colors cursor-pointer">
              <summary className="flex items-center justify-between text-sm font-semibold text-[#F5F5F0] list-none">
                <span>Are personal training sessions included in membership packages?</span>
                <ChevronDown className="h-4 w-4 text-[#A0A09B] transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-xs text-[#8E8E88] leading-relaxed">
                Yes! Gold Performance includes 2 sessions, Platinum Elite includes 6 sessions, and Black Diamond VIP includes 15 sessions. You can also purchase additional sessions at any time through the member portal.
              </p>
            </details>

            <details className="group card-luxury p-5 open:border-[#C8A96B]/50 transition-colors cursor-pointer">
              <summary className="flex items-center justify-between text-sm font-semibold text-[#F5F5F0] list-none">
                <span>How do automated email reminders work?</span>
                <ChevronDown className="h-4 w-4 text-[#A0A09B] transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-xs text-[#8E8E88] leading-relaxed">
                Our server-side scheduler checks memberships daily and sends courtesy email reminders at 7 days, 3 days, 1 day, and on the expiry day. Once you renew, future reminders for the superseded membership are immediately cancelled.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Concierge Contact Section */}
      <section className="py-24 bg-[#141414]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
                Private Concierge
              </span>
              <h2 className="text-3xl font-extrabold text-[#F5F5F0]">
                Schedule a Private Club Tour & Consultation
              </h2>
              <p className="text-xs sm:text-sm text-[#A0A09B] leading-relaxed">
                Experience our training floor, private infrared saunas, and biometric suites in person. Walk-in appointments and personalized athletic assessments available daily.
              </p>

              <div className="card-luxury p-5 space-y-3 bg-[#111] border-[#262626]">
                <strong className="text-xs text-[#C8A96B] uppercase tracking-wider block">
                  Club Location
                </strong>
                <p className="text-xs text-[#F5F5F0]">
                  {settings?.address || 'Level 4, Signature Towers, Financial District, Bangalore, KA 560103'}
                </p>
                <div className="pt-2 text-xs text-[#A0A09B] space-y-1">
                  <p>Concierge Phone: <strong className="text-[#F5F5F0]">{settings?.contactPhone || '+91 80 4990 8800'}</strong></p>
                  <p>Inquiries Email: <strong className="text-[#F5F5F0]">{settings?.contactEmail || 'concierge@fitlife.club'}</strong></p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <Footer gymInfo={settings} />
    </div>
  );
}
