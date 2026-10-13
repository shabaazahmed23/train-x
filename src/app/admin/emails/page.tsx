import { prisma } from '@/lib/prisma';
import { formatDate, formatDateTime, getStatusColor } from '@/lib/utils';
import { runMembershipReminderEngine } from '@/lib/reminders';
import { adminRetryFailedEmailAction } from '@/lib/actions';
import { Mail, Play, RotateCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminEmailsPage() {
  const [reminders, emailLogs] = await Promise.all([
    prisma.emailReminder.findMany({
      include: {
        membership: {
          include: {
            plan: true,
            member: { include: { user: true } },
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
      take: 20,
    }),
    prisma.emailLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 25,
    }),
  ]);

  async function triggerReminderJobAction() {
    'use server';
    await runMembershipReminderEngine();
    revalidatePath('/admin/emails');
    revalidatePath('/admin');
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
            Automated Reminder Subsystem
          </span>
          <h1 className="text-2xl font-black text-[#F5F5F0]">Expiry Reminders & Email Logs</h1>
          <p className="text-xs text-[#8E8E88]">
            Automated server-side scheduler, delivery status telemetry, and manual dispatch retries.
          </p>
        </div>

        <form action={triggerReminderJobAction}>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
          >
            <Play className="h-3.5 w-3.5 fill-black" />
            <span>Run Reminder Engine Now</span>
          </button>
        </form>
      </div>

      {/* Reminder Schedule Info Banner */}
      <div className="card-luxury p-4 bg-[#141414] border-[#2A2A2A] text-xs text-[#A0A09B] space-y-1">
        <strong className="text-[#C8A96B] uppercase font-mono tracking-wider block">
          Scheduler Policy:
        </strong>
        <p>
          Active memberships automatically evaluate daily at 00:00 UTC (05:30 IST) or on-demand. Reminders trigger at <strong>7 days</strong>, <strong>3 days</strong>, <strong>1 day</strong>, and <strong>on expiry day (0d)</strong>. Idempotency guarantees prevent duplicate dispatches, and pending reminders automatically cancel upon renewal.
        </p>
      </div>

      {/* Expiry Reminders Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#A0A09B]">
          Membership Expiry Reminders Queue
        </h2>

        <div className="card-luxury overflow-hidden bg-[#161616] border-[#262626]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222] text-[#8E8E88] bg-[#121212]">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Plan & Expiry</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Last Dispatched</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {reminders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-[#7E7E78]">
                      No renewal reminders are pending. Click &quot;Run Reminder Engine Now&quot; to scan for expiring memberships.
                    </td>
                  </tr>
                ) : (
                  reminders.map((r) => {
                    const color = getStatusColor(r.status);
                    return (
                      <tr key={r.id} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="py-3 px-4">
                          <strong className="text-[#F5F5F0] block">
                            {r.membership?.member.user.name || 'Member'}
                          </strong>
                          <span className="text-[11px] text-[#7E7E78]">{r.memberEmail}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#F5F5F0] font-medium">
                            {r.membership?.plan.name || 'Plan'}
                          </span>
                          <span className="text-[10px] text-[#7E7E78] block">
                            Expires: {r.membership ? formatDate(r.membership.endDate) : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#C8A96B]">
                          {r.reminderType.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color.bg} ${color.text} ${color.border}`}>
                            {r.status}
                          </span>
                          {r.lastError && (
                            <span className="text-[10px] text-rose-400 block max-w-xs truncate mt-0.5">
                              {r.lastError}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#A0A09B]">
                          {r.attemptCount}
                        </td>
                        <td className="py-3 px-4 text-[#7E7E78]">
                          {r.sentAt ? formatDateTime(r.sentAt) : 'Pending'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {r.status === 'FAILED' && (
                            <form
                              action={async () => {
                                'use server';
                                await adminRetryFailedEmailAction(r.id);
                              }}
                            >
                              <button
                                type="submit"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#222] hover:bg-[#333] border border-[#3A3A3A] text-[11px] text-[#C8A96B]"
                              >
                                <RotateCw className="h-3 w-3" /> Retry Dispatch
                              </button>
                            </form>
                          )}
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

      {/* General Email Logs Audit Trail */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#A0A09B]">
          Transactional Email Dispatch Logs
        </h2>

        <div className="card-luxury overflow-hidden bg-[#161616] border-[#262626]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222] text-[#8E8E88] bg-[#121212]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Template</th>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {emailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs text-[#7E7E78]">
                      No transactional email logs on record.
                    </td>
                  </tr>
                ) : (
                  emailLogs.map((log) => {
                    const color = getStatusColor(log.status);
                    return (
                      <tr key={log.id} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="py-2.5 px-3 text-[#7E7E78] font-mono">
                          {formatDateTime(log.sentAt)}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#F5F5F0]">
                          {log.recipientEmail}
                        </td>
                        <td className="py-2.5 px-3 text-[#A0A09B] max-w-sm truncate">
                          {log.subject}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-[#C8A96B]">
                          {log.templateType}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-[#7E7E78]">
                          {log.provider}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color.bg} ${color.text} ${color.border}`}>
                            {log.status}
                          </span>
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
    </div>
  );
}
