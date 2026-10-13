import { prisma } from '@/lib/prisma';
import { formatDate, getStatusColor } from '@/lib/utils';
import { adminUpdateBookingStatusAction } from '@/lib/actions';
import { Calendar, User, Dumbbell, Clock, Check, X, CheckCircle } from 'lucide-react';
import { BookingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  const bookings = await prisma.trainerBooking.findMany({
    include: {
      trainer: true,
      member: { include: { user: true } },
    },
    orderBy: { bookingDate: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#222] pb-6">
        <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
          Coaching Schedules
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F0]">Trainer Appointments & Bookings</h1>
        <p className="text-xs text-[#8E8E88]">
          Review personal training requests, oversee session capacities, and prevent schedule overlaps.
        </p>
      </div>

      <div className="card-luxury overflow-hidden bg-[#161616] border-[#262626]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222] text-[#8E8E88] bg-[#121212]">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Coach</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Member Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#7E7E78]">
                    No trainer sessions booked yet.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const color = getStatusColor(b.status);
                  return (
                    <tr key={b.id} className="hover:bg-[#1A1A1A] transition-colors">
                      <td className="py-3 px-4">
                        <strong className="text-[#F5F5F0] block">{formatDate(b.bookingDate)}</strong>
                        <span className="text-[11px] text-[#C8A96B] font-mono">
                          {b.startTime} - {b.endTime}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#F5F5F0]">{b.trainer.name}</span>
                        <span className="text-[10px] text-[#7E7E78] block">{b.trainer.specialties}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#F5F5F0]">{b.member.user.name}</span>
                        <span className="text-[10px] text-[#7E7E78] block font-mono">{b.member.membershipNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color.bg} ${color.text} ${color.border}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#8E8E88] max-w-xs truncate">
                        {b.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.status === BookingStatus.PENDING && (
                            <form
                              action={async () => {
                                'use server';
                                await adminUpdateBookingStatusAction(b.id, BookingStatus.CONFIRMED);
                              }}
                            >
                              <button
                                type="submit"
                                className="p-1.5 rounded bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-800 text-emerald-400"
                                title="Confirm Appointment"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            </form>
                          )}

                          {b.status === BookingStatus.CONFIRMED && (
                            <form
                              action={async () => {
                                'use server';
                                await adminUpdateBookingStatusAction(b.id, BookingStatus.COMPLETED);
                              }}
                            >
                              <button
                                type="submit"
                                className="px-2 py-1 rounded bg-[#222] hover:bg-[#333] border border-[#3A3A3A] text-[10px] text-[#F5F5F0]"
                                title="Mark Completed"
                              >
                                Complete
                              </button>
                            </form>
                          )}

                          {b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.COMPLETED && (
                            <form
                              action={async () => {
                                'use server';
                                await adminUpdateBookingStatusAction(b.id, BookingStatus.CANCELLED);
                              }}
                            >
                              <button
                                type="submit"
                                className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900 border border-rose-800 text-rose-400"
                                title="Cancel Booking"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
