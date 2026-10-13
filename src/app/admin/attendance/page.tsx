import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { AttendanceKiosk } from '@/components/admin/AttendanceKiosk';
import { QrCode, UserCheck, Clock, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAttendancePage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayLogs = await prisma.attendance.findMany({
    where: { checkInTime: { gte: startOfToday } },
    include: {
      member: {
        include: {
          user: true,
          memberships: {
            orderBy: { endDate: 'desc' },
            take: 1,
            include: { plan: true },
          },
        },
      },
    },
    orderBy: { checkInTime: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#222] pb-6">
        <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
          Facility Access Control
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F0]">QR Attendance & Turnstile Kiosk</h1>
        <p className="text-xs text-[#8E8E88]">
          Validate member passes, prevent expired access, and log physical check-ins.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Check-in Scanner / Kiosk */}
        <div className="lg:col-span-5">
          <AttendanceKiosk />
        </div>

        {/* Right: Today's Real-time Check-In Log */}
        <div className="lg:col-span-7 card-luxury p-6 bg-[#161616] border-[#262626]">
          <div className="flex items-center justify-between mb-4 border-b border-[#242424] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#F5F5F0]">Today&apos;s Turnstile Validations</h3>
              <p className="text-[11px] text-[#7E7E78]">
                {todayLogs.length} verified entries recorded today
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#C8A96B] px-2 py-0.5 rounded bg-[#C8A96B]/15 border border-[#C8A96B]/30">
              Live Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222] text-[#8E8E88]">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Membership #</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {todayLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[#7E7E78]">
                      No check-ins logged yet today. Use the simulator kiosk to scan a member.
                    </td>
                  </tr>
                ) : (
                  todayLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#1A1A1A] transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[#F5F5F0]">
                        {new Date(log.checkInTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#F5F5F0]">
                        {log.member.user.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#C8A96B]">
                        {log.member.membershipNumber}
                      </td>
                      <td className="py-2.5 px-3 text-[#A0A09B]">
                        {log.member.memberships[0]?.plan.name || 'Standard'}
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-[#7E7E78] uppercase">
                        {log.method.replace('_', ' ')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
