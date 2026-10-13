import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import { adminSaveOfferAction } from '@/lib/actions';
import { Tag, Plus, Check, Clock } from 'lucide-react';
import { DiscountType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminOffersPage() {
  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { redemptions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
            Promotions Engine
          </span>
          <h1 className="text-2xl font-black text-[#F5F5F0]">Offers & Coupons</h1>
          <p className="text-xs text-[#8E8E88]">
            Configure promotional codes, percentage discounts, validity windows, and usage caps.
          </p>
        </div>

        <details className="relative group">
          <summary className="list-none cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase tracking-wider transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>Create Promo Coupon</span>
          </summary>

          <div className="absolute right-0 top-12 z-50 w-96 card-luxury p-6 bg-[#161616] border-[#333] shadow-2xl">
            <form
              action={async (fd) => {
                'use server';
                await adminSaveOfferAction(fd);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[#A0A09B] mb-1">Coupon Title</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Monsoon Transformation 25%"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A0A09B] mb-1">Coupon Code</label>
                  <input
                    name="code"
                    required
                    placeholder="MONSOON25"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0] uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#A0A09B] mb-1">Type</label>
                  <select
                    name="discountType"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Cash (₹)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A0A09B] mb-1">Discount Value</label>
                  <input
                    name="discountValue"
                    type="number"
                    required
                    placeholder="25"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="block text-[#A0A09B] mb-1">Min Spend (₹)</label>
                  <input
                    name="minOrderAmount"
                    type="number"
                    defaultValue="5000"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A0A09B] mb-1">Start Date</label>
                  <input
                    name="startDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="block text-[#A0A09B] mb-1">Expiry Date</label>
                  <input
                    name="endDate"
                    type="date"
                    required
                    defaultValue={new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]}
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Usage Limit (Leave blank for infinite)</label>
                <input
                  name="usageLimit"
                  type="number"
                  placeholder="e.g. 100"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Terms / Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Applies to 90d and 180d packages..."
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <input type="hidden" name="isActive" value="true" />
              <input type="hidden" name="isPublic" value="true" />
              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold uppercase text-[11px]"
              >
                Save & Activate Coupon
              </button>
            </form>
          </div>
        </details>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="card-luxury p-5 bg-[#161616] border-[#262626] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#C8A96B] bg-[#C8A96B]/15 px-2.5 py-1 rounded border border-[#C8A96B]/30">
                {offer.code}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                {offer.isActive ? 'Active' : 'Disabled'}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#F5F5F0]">{offer.title}</h3>
              <p className="text-xs text-[#8E8E88] mt-0.5">{offer.description}</p>
            </div>

            <div className="bg-[#121212] p-2.5 rounded border border-[#222] text-xs text-[#A0A09B] space-y-1">
              <div className="flex justify-between">
                <span>Discount:</span>
                <strong className="text-[#C8A96B]">
                  {offer.discountType === 'PERCENTAGE'
                    ? `${offer.discountValue}%`
                    : formatCurrency(offer.discountValue)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Usage Count:</span>
                <span className="text-[#F5F5F0]">
                  {offer.timesUsed} {offer.usageLimit ? `/ ${offer.usageLimit}` : 'redemptions'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Valid:</span>
                <span className="text-[#7E7E78]">
                  {formatDate(offer.startDate)} &rarr; {formatDate(offer.endDate)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
