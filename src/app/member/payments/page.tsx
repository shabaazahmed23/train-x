import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { ReceiptModal } from '@/components/member/ReceiptModal';
import { Receipt, CheckCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MemberPaymentsPage() {
  const session = await requireAuth();

  const profile = await prisma.memberProfile.findUnique({
    where: { userId: session.id },
    include: {
      user: true,
      payments: {
        include: {
          membership: { include: { plan: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const payments = profile?.payments || [];

  return (
    <div className="space-y-8">
      <div className="border-b border-[#222] pb-6">
        <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
          Billing Statements
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F0]">Payment History & Tax Invoices</h1>
        <p className="text-xs text-[#8E8E88]">
          Review past membership transactions, verified UPI orders, and printable invoices.
        </p>
      </div>

      <div className="card-luxury overflow-hidden bg-[#161616] border-[#262626]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222] text-[#8E8E88] bg-[#121212]">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#7E7E78]">
                    No transaction records on file.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const color = getStatusColor(p.status);
                  const receiptData = {
                    receiptNumber: p.receiptNumber,
                    amount: Number(p.amount),
                    currency: p.currency,
                    method: p.method,
                    status: p.status,
                    createdAt: p.createdAt.toISOString(),
                    planName: p.membership?.plan.name || p.notes || 'Gym Membership',
                    memberName: profile?.user.name || session.name,
                    membershipNumber: profile?.membershipNumber || 'FL-2026',
                  };

                  return (
                    <tr key={p.id} className="hover:bg-[#1A1A1A] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#C8A96B]">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#F5F5F0]">
                        {p.membership?.plan.name || 'Membership Enrollment'}
                      </td>
                      <td className="py-3 px-4 font-black text-[#F5F5F0]">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 px-4 font-mono uppercase text-[#A0A09B]">
                        {p.method}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color.bg} ${color.text} ${color.border}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#7E7E78]">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <ReceiptModal receipt={receiptData} />
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
