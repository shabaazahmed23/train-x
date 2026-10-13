import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { adminSaveTrainerAction } from '@/lib/actions';
import { Dumbbell, Plus, Phone, Mail, Award, Check } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminTrainersPage() {
  const trainers = await prisma.trainer.findMany({
    orderBy: { experienceYears: 'desc' },
    include: {
      _count: { select: { bookings: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
            Faculty Roster
          </span>
          <h1 className="text-2xl font-black text-[#F5F5F0]">Master Coaches & Trainers</h1>
          <p className="text-xs text-[#8E8E88]">
            Manage coach profiles, specialties, rates, and personal training capacity.
          </p>
        </div>

        <details className="relative group">
          <summary className="list-none cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase tracking-wider transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Trainer</span>
          </summary>

          <div className="absolute right-0 top-12 z-50 w-96 card-luxury p-6 bg-[#161616] border-[#333] shadow-2xl">
            <form
              action={async (fd) => {
                'use server';
                await adminSaveTrainerAction(fd);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[#A0A09B] mb-1">Coach Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Samar Malhotra"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="samar@fitlife.club"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A0A09B] mb-1">Hourly Rate (₹)</label>
                  <input
                    name="hourlyRate"
                    type="number"
                    required
                    defaultValue="1200"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="block text-[#A0A09B] mb-1">Years Experience</label>
                  <input
                    name="experienceYears"
                    type="number"
                    required
                    defaultValue="5"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Specialties</label>
                <input
                  name="specialties"
                  placeholder="Olympic Lifting, Hypertrophy, Mobility"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Photo URL</label>
                <input
                  name="photoUrl"
                  placeholder="https://..."
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Biography</label>
                <textarea
                  name="bio"
                  rows={3}
                  required
                  placeholder="Credentials and coaching methodology..."
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <input type="hidden" name="isPublished" value="true" />
              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold uppercase text-[11px]"
              >
                Save Coach Profile
              </button>
            </form>
          </div>
        </details>
      </div>

      {trainers.length === 0 ? (
        <div className="card-luxury p-12 text-center border-[#262626] bg-[#161616] flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center text-[#C8A96B] mb-4">
            <Dumbbell className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[#F5F5F0]">No trainers have been added yet.</h3>
          <p className="text-xs text-[#8E8E88] mt-2 max-w-md">
            Click &quot;Add Trainer&quot; above to onboard your certified personal trainers and coaches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainers.map((t) => (
            <div key={t.id} className="card-luxury p-6 flex flex-col sm:flex-row gap-5 items-start bg-[#161616] border-[#262626]">
              <div className="h-28 w-28 shrink-0 rounded bg-[#222] border border-[#333] overflow-hidden">
                {t.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photoUrl} alt={t.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[#7E7E78]">
                    <Dumbbell className="h-8 w-8" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#F5F5F0]">{t.name}</h3>
                  <span className="text-[10px] font-mono text-[#C8A96B] bg-[#C8A96B]/15 px-2 py-0.5 rounded border border-[#C8A96B]/30">
                    {t.experienceYears} Yrs Exp
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#C8A96B]">{t.specialties}</p>
                <p className="text-[#8E8E88] line-clamp-2">{t.bio}</p>

                <div className="pt-2 border-t border-[#222] flex items-center justify-between text-[11px]">
                  <span className="text-[#A0A09B]">Rate: <strong className="text-[#F5F5F0]">{formatCurrency(t.hourlyRate)}/hr</strong></span>
                  <span className="text-[#A0A09B] font-mono">{t._count.bookings} Bookings</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
