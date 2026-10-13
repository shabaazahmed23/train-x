import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate, getStatusColor, generateReceiptNumber } from '@/lib/utils';
import { CreditCard, Plus, Receipt, Filter } from 'lucide-react';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string; status?: string }>;
}) {
  const { method, status } = await searchParams;

  const whereClause: any = {};
  if (method) whereClause.method = method as PaymentMethod;
  if (status) whereClause.status = status as PaymentStatus;

  const [payments, completedAgg, pendingAgg, members, plans] = await Promise.all([
    prisma.payment.findMany({
      where: whereClause,
      include: {
        member: { include: { user: true } },
        membership: { include: { plan: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.PENDING },
      _sum: { amount: true },
    }),
    prisma.memberProfile.findMany({
      include: { user: true },
    }),
    prisma.membershipPlan.findMany(),
  ]);

  const totalCollected = Number(completedAgg._sum.amount || 0);
  const totalPending = Number(pendingAgg._sum.amount || 0);

  async function recordCashPaymentAction(formData: FormData) {
    'use server';
    const memberId = formData.get('memberId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const method = (formData.get('method') as PaymentMethod) || PaymentMethod.CASH;
    const notes = (formData.get('notes') as string)?.trim();

    if (!memberId || isNaN(amount)) return;

    const receiptNumber = generateReceiptNumber();

    await prisma.payment.create({
      data: {
        memberId,
        amount,
        currency: 'INR',
        method,
        status: PaymentStatus.COMPLETED,
        receiptNumber,
        verifiedAt: new Date(),
        notes: notes || 'Front desk transaction logged by administrator',
      },
    });

    revalidatePath('/admin/payments');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
            Financial Records
          </span>
          <h1 className="text-2xl font-black text-[#F5F5F0]">Ledger & Transaction Receipts</h1>
          <p className="text-xs text-[#8E8E88]">
            Audit payments, issue front-desk cash receipts, and monitor merchant collections.
          </p>
        </div>

        <details className="relative group">
          <summary className="list-none cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase tracking-wider transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>Record Cash / POS Payment</span>
          </summary>

          <div className="absolute right-0 top-12 z-50 w-96 card-luxury p-6 bg-[#161616] border-[#333] shadow-2xl">
            <h3 className="text-sm font-bold text-[#F5F5F0] mb-4">Record In-Person Payment</h3>
            <form action={recordCashPaymentAction} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A0A09B] mb-1">Select Member</label>
                <select
                  name="memberId"
                  required
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user.name} ({m.membershipNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A0A09B] mb-1">Amount (₹)</label>
                  <input
                    name="amount"
                    type="number"
                    required
                    defaultValue="2999"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="block text-[#A0A09B] mb-1">Method</label>
                  <select
                    name="method"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="CARD">Credit / Debit Card POS</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Notes / Description</label>
                <input
                  name="notes"
                  placeholder="e.g. Quarterly renewal cash receipt"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold uppercase text-[11px]"
              >
                Record Payment & Issue Receipt
              </button>
            </form>
          </div>
        </details>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card-luxury p-5 bg-[#161616]">
          <span className="text-[11px] text-[#8E8E88] uppercase block">Total Verified Collections</span>
          <span className="text-2xl font-black text-[#F5F5F0]">{formatCurrency(totalCollected)}</span>
          <p className="text-[10px] text-emerald-400 mt-1">Confirmed in gym bank account</p>
        </div>

        <div className="card-luxury p-5 bg-[#161616]">
          <span className="text-[11px] text-[#8E8E88] uppercase block">Pending / Uncollected</span>
          <span className="text-2xl font-black text-amber-400">{formatCurrency(totalPending)}</span>
          <p className="text-[10px] text-[#7E7E78] mt-1">Not counted towards revenue</p>
        </div>

        <div className="card-luxury p-5 bg-[#161616]">
          <span className="text-[11px] text-[#8E8E88] uppercase block">Total Transactions</span>
          <span className="text-2xl font-black text-[#C8A96B]">{payments.length} Records</span>
          <p className="text-[10px] text-[#7E7E78] mt-1">Both online and desk payments</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card-luxury overflow-hidden bg-[#161616] border-[#262626]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222] text-[#8E8E88] bg-[#121212]">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Allocated To</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {payments.map((p) => {
                const color = getStatusColor(p.status);
                return (
                  <tr key={p.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#C8A96B]">{p.receiptNumber}</td>
                    <td className="py-3 px-4">
                      <strong className="text-[#F5F5F0] block">{p.member.user.name}</strong>
                      <span className="text-[10px] text-[#7E7E78] font-mono">{p.member.membershipNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-[#A0A09B]">
                      {p.membership?.plan.name || p.notes || 'General Gym Fee'}
                    </td>
                    <td className="py-3 px-4 font-black text-[#F5F5F0]">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-4 font-mono uppercase text-[#A0A09B]">{p.method}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color.bg} ${color.text} ${color.border}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#7E7E78]">{formatDate(p.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
