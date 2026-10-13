import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { DEFAULT_SETTINGS, withTimeout } from '@/lib/data-defaults';
import { Award, ShieldCheck, HeartPulse, Sparkles, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const session = await getSession();
  let settings: any = DEFAULT_SETTINGS;
  try {
    const dbPromise = prisma.gymSettings.findUnique({ where: { id: 'default-settings' } });
    const result = await withTimeout(dbPromise, 2500, null);
    if (result) settings = result;
  } catch (error) {
    console.error('Database query error in AboutPage:', error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#111111]">
      <Navbar session={session} />

      <main className="flex-1">
        {/* Header */}
        <section className="py-20 bg-[#141414] border-b border-[#222222]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
              The FITLIFE Legacy
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F0] mt-2 mb-4">
              Where Athletic Excellence Meets Curated Luxury
            </h1>
            <p className="text-base text-[#A0A09B] max-w-2xl leading-relaxed">
              Founded on the belief that peak athletic conditioning and uncompromised luxury should coexist, FITLIFE provides an inspiring training sanctuary for athletes, executives, and fitness devotees.
            </p>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-20 border-b border-[#222222]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card-luxury p-8 space-y-3">
                <div className="h-10 w-10 rounded bg-[#C8A96B]/10 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B]">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#F5F5F0]">Olympic Standard Rigging</h3>
                <p className="text-xs text-[#8E8E88] leading-relaxed">
                  Every barbell, disc, and power rack in our club meets International Weightlifting Federation (IWF) specifications. We prioritize joint longevity and biomechanical precision.
                </p>
              </div>

              <div className="card-luxury p-8 space-y-3">
                <div className="h-10 w-10 rounded bg-[#C8A96B]/10 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B]">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#F5F5F0]">Evidence-Based Recovery</h3>
                <p className="text-xs text-[#8E8E88] leading-relaxed">
                  Our private recovery suites feature Scandinavian Cedar Far-Infrared saunas, 4°C cold hydrotherapy tubs, and pneumatic lymphatic drainage boots to accelerate systemic muscular repair.
                </p>
              </div>

              <div className="card-luxury p-8 space-y-3">
                <div className="h-10 w-10 rounded bg-[#C8A96B]/10 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#F5F5F0]">Master Coach Pedigree</h3>
                <p className="text-xs text-[#8E8E88] leading-relaxed">
                  Our coaches hold CSCS credentials and national powerlifting, bodybuilding, or physical therapy certifications. Every member receives scientific, personalized guidance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-16 bg-[#161616] text-center">
          <div className="mx-auto max-w-2xl px-4 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F0]">
              Ready to Redefine Your Standard?
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A09B]">
              Join Bangalore&apos;s most inspiring athletic community today.
            </p>
            <div className="pt-2">
              <Link
                href={session ? (session.role === 'ADMIN' ? '/admin' : '/member') : '/register'}
                prefetch={true}
                className="inline-flex items-center gap-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-[#111] font-bold text-xs uppercase tracking-wider px-6 py-3.5 transition-all shadow-md shadow-[#C8A96B]/15"
              >
                {session ? (session.role === 'ADMIN' ? 'Go to Admin Portal' : 'Go to Member Dashboard') : 'Enroll Today'} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer gymInfo={settings} />
    </div>
  );
}
