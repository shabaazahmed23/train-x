import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { formatDate, formatCurrency, getStatusColor, calculateRemainingDays } from '@/lib/utils';
import { adminCreateMemberAction } from '@/lib/actions';
import {
  Users,
  Search,
  Download,
  Plus,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const now = new Date();

  // Filter conditions
  const whereClause: Prisma.MemberProfileWhereInput = {};
  if (q) {
    whereClause.OR = [
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { membershipNumber: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [members, plans] = await Promise.all([
    prisma.memberProfile.findMany({
      where: whereClause,
      include: {
        user: true,
        memberships: {
          orderBy: { endDate: 'desc' },
          take: 1,
          include: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.membershipPlan.findMany({
      where: { isPublished: true },
      orderBy: { price: 'asc' },
    }),
  ]);

  // Status filtering in memory for memberships
  const filteredMembers = members.filter((m) => {
    if (!status || status === 'ALL') return true;
    const current = m.memberships[0];
    if (!current) return status === 'INACTIVE';
    if (status === 'ACTIVE') return current.status === 'ACTIVE' && current.endDate >= now;
    if (status === 'EXPIRING_SOON') return current.status === 'EXPIRING_SOON';
    if (status === 'EXPIRED') return current.status === 'EXPIRED' || current.endDate < now;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
            Member Directory
          </span>
          <h1 className="text-2xl font-black text-[#F5F5F0]">Member Management</h1>
          <p className="text-xs text-[#8E8E88]">
            Manage memberships, emergency records, enrollments, and status tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/admin/export-members"
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#333] hover:border-[#C8A96B] bg-[#161616] text-xs font-semibold text-[#F5F5F0] transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-[#C8A96B]" />
            <span>Export CSV</span>
          </a>

          <details className="relative group">
            <summary className="list-none cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase tracking-wider transition-colors">
              <Plus className="h-3.5 w-3.5" />
              <span>Enroll Member</span>
            </summary>

            <div className="absolute right-0 top-12 z-50 w-96 card-luxury p-6 bg-[#161616] border-[#333] shadow-2xl">
              <form
                action={async (fd) => {
                  'use server';
                  await adminCreateMemberAction(fd);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-[#A0A09B] mb-1">Full Legal Name</label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Yashvardhan Singhania"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="block text-[#A0A09B] mb-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="yash@example.com"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="block text-[#A0A09B] mb-1">Contact Phone</label>
                  <input
                    name="phone"
                    placeholder="+91 98000 11111"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="block text-[#A0A09B] mb-1">Select Membership Plan</label>
                  <select
                    name="planId"
                    required
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.price)} ({p.durationDays}d)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#A0A09B] mb-1">Payment Method</label>
                  <select
                    name="paymentMethod"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  >
                    <option value="CASH">Cash (Front Desk)</option>
                    <option value="UPI">UPI Merchant QR</option>
                    <option value="CARD">Credit/Debit Card POS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#A0A09B] mb-1">Emergency Contact & Phone</label>
                  <input
                    name="emergencyContact"
                    placeholder="Name & Relation"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0] mb-2"
                  />
                  <input
                    name="emergencyPhone"
                    placeholder="Emergency Phone #"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold uppercase text-[11px]"
                >
                  Create & Activate Membership
                </button>
              </form>
            </div>
          </details>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#141414] p-4 rounded border border-[#242424]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#7E7E78]" />
          <form method="GET">
            <input
              name="q"
              defaultValue={q || ''}
              placeholder="Search by name, email, or membership ID (e.g. FL-2026-0001)..."
              className="w-full rounded bg-[#101010] border border-[#282828] pl-9 pr-3.5 py-2 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
            />
          </form>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {['ALL', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED'].map((s) => (
            <Link
              key={s}
              href={`/admin/members?status=${s}${q ? `&q=${q}` : ''}`}
              className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                (status || 'ALL') === s
                  ? 'bg-[#C8A96B] text-black font-semibold'
                  : 'bg-[#1C1C1C] text-[#A0A09B] hover:text-[#F5F5F0]'
              }`}
            >
              {s.replace('_', ' ')}
            </Link>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="card-luxury overflow-hidden bg-[#161616] border-[#262626]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#242424] text-[#8E8E88] bg-[#121212]">
                <th className="py-3 px-4">Member ID</th>
                <th className="py-3 px-4">Member Details</th>
                <th className="py-3 px-4">Active Plan</th>
                <th className="py-3 px-4">Status & Remaining</th>
                <th className="py-3 px-4">Emergency Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#7E7E78]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="text-sm font-semibold text-[#F5F5F0]">
                        {members.length === 0
                          ? 'No members registered yet. Add your first member to get started.'
                          : 'No members match the query filters.'}
                      </p>
                      {members.length === 0 && (
                        <p className="text-[11px] text-[#8E8E88]">
                          Click &quot;Enroll Member&quot; above to register your first gym member.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const current = m.memberships[0];
                  const remainingDays = current ? calculateRemainingDays(current.endDate) : 0;
                  const color = getStatusColor(current?.status || 'INACTIVE');

                  return (
                    <tr key={m.id} className="hover:bg-[#1A1A1A] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#C8A96B]">
                        {m.membershipNumber}
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-[#F5F5F0] block">{m.user.name}</strong>
                        <span className="text-[11px] text-[#7E7E78]">{m.user.email}</span>
                        {m.user.phone && (
                          <span className="text-[10px] text-[#A0A09B] block">{m.user.phone}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#F5F5F0]">
                          {current?.plan?.name || 'No Plan Assigned'}
                        </span>
                        {current && (
                          <span className="text-[10px] text-[#7E7E78] block">
                            Valid: {formatDate(current.startDate)} &rarr; {formatDate(current.endDate)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color.bg} ${color.text} ${color.border}`}>
                            {current?.status || 'NO_MEMBERSHIP'}
                          </span>
                          {current && remainingDays > 0 && (
                            <span className="text-[11px] text-[#A0A09B] font-mono">
                              ({remainingDays}d left)
                            </span>
                          )}
                          {current && remainingDays <= 0 && (
                            <span className="text-[11px] text-rose-400 font-mono">
                              (Expired)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#8E8E88]">
                        <span>{m.emergencyContact || '—'}</span>
                        {m.emergencyPhone && (
                          <span className="text-[10px] text-[#7E7E78] block">{m.emergencyPhone}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] text-[#C8A96B] font-mono">
                          ID: {m.id.slice(0, 6)}
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
  );
}
