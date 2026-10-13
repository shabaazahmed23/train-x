import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { formatDate, getStatusColor } from '@/lib/utils';
import { QrCode, ShieldCheck, CheckCircle2, Calendar, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MemberAttendancePage() {
  const session = await requireAuth();

  const profile = await prisma.memberProfile.findUnique({
    where: { userId: session.id },
    include: {
      user: true,
      memberships: {
        orderBy: { endDate: 'desc' },
        take: 1,
        include: { plan: true },
      },
      attendances: {
        orderBy: { checkInTime: 'desc' },
        take: 20,
      },
    },
  });

  const membership = profile?.memberships[0];
  const membershipNumber = profile?.membershipNumber || 'FL-2026-0001';

  // Generate QR Code data URL
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(membershipNumber, {
      width: 260,
      margin: 1,
      color: {
        dark: '#111111',
        light: '#FFFFFF',
      },
    });
  } catch (e) {
    console.error('Failed to generate QR data URL:', e);
  }

  const attendances = profile?.attendances || [];

  return (
    <div className="space-y-8">
      <div className="border-b border-[#222] pb-6">
        <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
          Facility Access Card
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F0]">Digital Turnstile Pass & Visit Logs</h1>
        <p className="text-xs text-[#8E8E88]">
          Present this verified biometric QR pass at turnstiles and luxury locker pavilions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Luxury Digital Membership Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#1C1C1C] via-[#161616] to-[#0E0E0E] p-6 border border-[#C8A96B]/50 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A96B]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Pass Header */}
            <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-[#111] border border-[#C8A96B] flex items-center justify-center font-black text-[#C8A96B] text-sm">
                  F
                </div>
                <div>
                  <span className="text-sm font-extrabold tracking-widest text-[#F5F5F0]">
                    FIT<span className="text-[#C8A96B]">LIFE</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#A0A09B] block">
                    Digital Member Pass
                  </span>
                </div>
              </div>
              <ShieldCheck className="h-5 w-5 text-[#C8A96B]" />
            </div>

            {/* Pass QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner mx-auto w-56 h-56">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`QR Pass for ${membershipNumber}`}
                  className="w-48 h-48"
                />
              ) : (
                <QrCode className="h-32 w-32 text-black" />
              )}
            </div>

            {/* Member Details */}
            <div className="space-y-2 border-t border-[#262626] pt-4 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-[#7E7E78] text-[10px] uppercase font-mono">Member Name</span>
                <strong className="text-[#F5F5F0] text-sm">{profile?.user.name}</strong>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#7E7E78] text-[10px] uppercase font-mono">Pass Number</span>
                <span className="font-mono text-[#C8A96B] font-bold tracking-wider">{membershipNumber}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#7E7E78] text-[10px] uppercase font-mono">Current Plan</span>
                <span className="text-[#F5F5F0] font-medium">{membership?.plan.name || 'Standard Access'}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#7E7E78] text-[10px] uppercase font-mono">Valid Through</span>
                <span className="text-emerald-400 font-medium">
                  {membership ? formatDate(membership.endDate) : 'Expired'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Visit Logs */}
        <div className="lg:col-span-7 card-luxury p-6 bg-[#161616] border-[#262626]">
          <h2 className="text-sm font-bold text-[#F5F5F0] mb-4 border-b border-[#242424] pb-3">
            Facility Check-in History ({attendances.length} visits logged)
          </h2>

          <div className="space-y-2.5">
            {attendances.length === 0 ? (
              <p className="text-xs text-[#7E7E78] py-8 text-center">
                No attendance records for this period. Present your QR code at the turnstile kiosk on your next workout.
              </p>
            ) : (
              attendances.map((att) => (
                <div
                  key={att.id}
                  className="p-3 rounded bg-[#121212] border border-[#242424] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="text-[#F5F5F0] block">{formatDate(att.checkInTime)}</strong>
                      <span className="text-[10px] text-[#7E7E78]">
                        Verified by {att.verifiedBy || 'Turnstile Scanner'}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-[#C8A96B] font-bold text-xs">
                    {new Date(att.checkInTime).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
