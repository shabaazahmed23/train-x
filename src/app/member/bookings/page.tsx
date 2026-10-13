import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { formatDate, getStatusColor } from '@/lib/utils';
import { BookingForm } from '@/components/member/BookingForm';
import { Calendar, User, Dumbbell, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MemberBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ trainerId?: string }>;
}) {
  const session = await requireAuth();
  const { trainerId } = await searchParams;

  const [trainers, profile] = await Promise.all([
    prisma.trainer.findMany({
      where: { isPublished: true, isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.memberProfile.findUnique({
      where: { userId: session.id },
      include: {
        bookings: {
          include: { trainer: true },
          orderBy: { bookingDate: 'desc' },
        },
      },
    }),
  ]);

  const trainerOptions = trainers.map((t) => ({
    id: t.id,
    name: t.name,
    specialties: t.specialties,
    hourlyRate: Number(t.hourlyRate),
  }));

  const bookings = profile?.bookings || [];

  return (
    <div className="space-y-8">
      <div className="border-b border-[#222] pb-6">
        <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
          Private Coaching
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F0]">Personal Training Appointments</h1>
        <p className="text-xs text-[#8E8E88]">
          Schedule 1-on-1 athletic coaching sessions and review your upcoming training calendar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Booking Form */}
        <div className="lg:col-span-5">
          <BookingForm
            trainers={trainerOptions}
            preselectedTrainerId={trainerId}
          />
        </div>

        {/* Bookings History */}
        <div className="lg:col-span-7 card-luxury p-6 bg-[#161616] border-[#262626]">
          <h2 className="text-sm font-bold text-[#F5F5F0] mb-4 border-b border-[#242424] pb-3">
            Your Coaching Calendar ({bookings.length})
          </h2>

          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-xs text-[#7E7E78] py-8 text-center">
                You have no scheduled coaching sessions. Use the form to book your coach!
              </p>
            ) : (
              bookings.map((b) => {
                const color = getStatusColor(b.status);
                return (
                  <div
                    key={b.id}
                    className="p-4 rounded bg-[#121212] border border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <strong className="text-sm text-[#F5F5F0]">Coach {b.trainer.name}</strong>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color.bg} ${color.text} ${color.border}`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#C8A96B] font-mono">
                        {formatDate(b.bookingDate)} &bull; {b.startTime} - {b.endTime}
                      </p>
                      {b.notes && (
                        <p className="text-[11px] text-[#8E8E88] mt-1">Focus: {b.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
