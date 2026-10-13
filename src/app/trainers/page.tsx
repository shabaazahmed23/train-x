import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Dumbbell, Calendar, Clock, Star, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TrainersPage() {
  const session = await getSession();
  const [trainers, settings] = await Promise.all([
    prisma.trainer.findMany({
      where: { isPublished: true, isActive: true },
      orderBy: { experienceYears: 'desc' },
      include: {
        availabilities: true,
      },
    }),
    prisma.gymSettings.findUnique({ where: { id: 'default-settings' } }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#111111]">
      <Navbar session={session} />

      <main className="flex-1">
        <section className="py-20 bg-[#141414] border-b border-[#222222]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
              Master Coaching Faculty
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F0] mt-2 mb-4">
              Mentored by the Elite
            </h1>
            <p className="text-base text-[#A0A09B] leading-relaxed">
              Our faculty comprises national powerlifting champions, physical therapists, and certified biomechanics specialists who apply science to your transformation.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {trainers.map((trainer) => (
                <div key={trainer.id} className="card-luxury p-6 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="h-44 w-44 shrink-0 rounded-lg overflow-hidden bg-[#222] border border-[#333]">
                    {trainer.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={trainer.photoUrl}
                        alt={trainer.name}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#7E7E78]">
                        <Dumbbell className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#F5F5F0]">{trainer.name}</h3>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#C8A96B]/15 text-[#C8A96B] border border-[#C8A96B]/30">
                          {trainer.experienceYears}+ Yrs Coaching
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#C8A96B] mt-0.5">
                        {trainer.specialties}
                      </p>
                    </div>

                    <p className="text-xs text-[#8E8E88] leading-relaxed">
                      {trainer.bio}
                    </p>

                    <div className="pt-2 border-t border-[#242424] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[#A0A09B]">Session Investment: </span>
                        <strong className="text-[#F5F5F0]">{formatCurrency(trainer.hourlyRate)}/hr</strong>
                      </div>

                      <Link
                        href={`/member/bookings?trainerId=${trainer.id}`}
                        className="flex items-center gap-1.5 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold text-[11px] uppercase tracking-wider py-1.5 px-3 transition-colors"
                      >
                        Book Session <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer gymInfo={settings} />
    </div>
  );
}
