'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { bookTrainerSessionAction } from '@/lib/actions';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TrainerOption {
  id: string;
  name: string;
  specialties: string;
  hourlyRate: number;
}

interface BookingFormProps {
  trainers: TrainerOption[];
  preselectedTrainerId?: string;
}

export function BookingForm({ trainers, preselectedTrainerId }: BookingFormProps) {
  const router = useRouter();
  const [trainerId, setTrainerId] = useState(preselectedTrainerId || trainers[0]?.id || '');
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow
  );
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const res = await bookTrainerSessionAction({
        trainerId,
        bookingDate,
        startTime,
        endTime,
        notes,
      });

      if (res.success) {
        setSuccess(true);
        setNotes('');
        router.refresh();
      } else {
        setError(res.error || 'Failed to book trainer session.');
      }
    });
  };

  const selectedTrainer = trainers.find((t) => t.id === trainerId);

  return (
    <div className="card-luxury p-6 bg-[#161616] border-[#262626] space-y-4">
      <div className="flex items-center gap-3 border-b border-[#242424] pb-3">
        <div className="h-9 w-9 rounded bg-[#C8A96B]/15 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B]">
          <Calendar className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#F5F5F0]">Book Private Training Session</h3>
          <p className="text-[11px] text-[#7E7E78]">1-on-1 coaching session with conflict checking</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Session confirmed! A notification has been dispatched to your email.</span>
        </div>
      )}

      <form onSubmit={handleBooking} className="space-y-4 text-xs">
        <div>
          <label className="block text-[#A0A09B] mb-1 font-medium">Select Master Coach</label>
          <select
            value={trainerId}
            onChange={(e) => setTrainerId(e.target.value)}
            className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
          >
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.specialties}) — {formatCurrency(t.hourlyRate)}/hr
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[#A0A09B] mb-1 font-medium">Session Date</label>
          <input
            type="date"
            required
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[#A0A09B] mb-1 font-medium">Start Time</label>
            <select
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                const hour = parseInt(e.target.value.split(':')[0], 10);
                setEndTime(`${String(hour + 1).padStart(2, '0')}:00`);
              }}
              className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0]"
            >
              {['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#A0A09B] mb-1 font-medium">End Time</label>
            <input
              type="text"
              readOnly
              value={endTime}
              className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#A0A09B] cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#A0A09B] mb-1 font-medium">Session Focus / Goals</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Deadlift technique, shoulder warmup..."
            className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold uppercase text-xs tracking-wider transition-colors disabled:opacity-50"
        >
          {isPending ? 'Verifying Availability...' : 'Confirm Appointment'}
        </button>
      </form>
    </div>
  );
}
