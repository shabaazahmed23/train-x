'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { renewMembershipAction, validateCouponServer } from '@/lib/actions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RotateCw, CheckCircle2, ArrowRight, Tag, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlanOption {
  id: string;
  name: string;
  slug: string;
  price: number;
  durationDays: number;
  durationType: string;
}

interface RenewalFormProps {
  plans: PlanOption[];
  currentMembership?: {
    id: string;
    endDate: string;
    planName: string;
    isActive: boolean;
  } | null;
}

export function RenewalForm({ plans, currentMembership }: RenewalFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSlug = searchParams.get('plan');
  const defaultCoupon = searchParams.get('coupon');

  const initialPlan =
    plans.find((p) => p.slug === defaultSlug) ||
    plans.find((p) => p.name === currentMembership?.planName) ||
    plans[0];

  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan?.id || '');
  const [couponCode, setCouponCode] = useState(defaultCoupon || '');
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'ONLINE' | 'CARD' | 'CASH'>('UPI');
  const [isPending, startTransition] = useTransition();
  const [successResult, setSuccessResult] = useState<{
    receiptNumber: string;
    newEndDate: string;
  } | null>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const originalPrice = selectedPlan ? Number(selectedPlan.price) : 0;
  const discount = couponApplied ? couponApplied.discountAmount : 0;
  const finalPrice = Math.max(0, originalPrice - discount);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponError(null);

    startTransition(async () => {
      const res = await validateCouponServer(couponCode, originalPrice);
      if (res.valid) {
        setCouponApplied({
          code: res.code || couponCode.toUpperCase(),
          discountAmount: res.discountAmount,
        });
        setCouponError(null);
      } else {
        setCouponApplied(null);
        setCouponError(res.error || 'Invalid promotional code');
      }
    });
  };

  const handleExecuteRenewal = () => {
    startTransition(async () => {
      const res = await renewMembershipAction({
        planId: selectedPlan.id,
        couponCode: couponApplied?.code,
        paymentMethod: paymentMethod as any,
      });

      if (res.success && res.receiptNumber && res.newEndDate) {
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {}
        setSuccessResult({
          receiptNumber: res.receiptNumber,
          newEndDate: new Date(res.newEndDate).toISOString(),
        });
        router.refresh();
      }
    });
  };

  if (successResult) {
    return (
      <div className="card-luxury p-8 sm:p-12 text-center space-y-4 border-emerald-800/60 bg-emerald-950/20">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#C8A96B]">
          Transaction Verified
        </span>
        <h2 className="text-2xl font-black text-[#F5F5F0]">
          Membership Successfully Extended!
        </h2>
        <p className="text-xs text-[#A0A09B] max-w-md mx-auto leading-relaxed">
          Your access privileges have been seamlessly updated. All previous remaining days were preserved and your new expiration date is now active.
        </p>

        <div className="max-w-xs mx-auto p-4 rounded bg-[#161616] border border-[#2D2D2D] text-xs space-y-1.5 text-left">
          <div className="flex justify-between">
            <span className="text-[#8E8E88]">Receipt #:</span>
            <strong className="text-[#C8A96B] font-mono">{successResult.receiptNumber}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8E8E88]">New Expiry Date:</span>
            <strong className="text-[#F5F5F0]">{formatDate(successResult.newEndDate)}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8E8E88]">Amount Paid:</span>
            <strong className="text-[#F5F5F0]">{formatCurrency(finalPrice)}</strong>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => router.push('/member')}
            className="rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold text-xs uppercase tracking-wider py-3 px-6"
          >
            Go to Member Dashboard
          </button>
          <button
            onClick={() => router.push('/member/payments')}
            className="rounded border border-[#3A3A3A] hover:border-[#C8A96B] text-[#F5F5F0] text-xs font-semibold uppercase py-3 px-6"
          >
            Download Invoice Receipt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Plan & Method Selection */}
      <div className="lg:col-span-7 space-y-6">
        {/* Early Renewal Preservation Notice */}
        {currentMembership?.isActive && (
          <div className="card-luxury p-4 bg-[#181818] border-[#C8A96B]/40 flex items-start gap-3 text-xs text-[#A0A09B]">
            <ShieldCheck className="h-5 w-5 text-[#C8A96B] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#F5F5F0] block">Early Renewal Time Preservation Active</strong>
              <span>
                Your current plan expires on <strong>{formatDate(currentMembership.endDate)}</strong>. Renewing now preserves all remaining days by starting the new duration from your current expiry date!
              </span>
            </div>
          </div>
        )}

        {/* Plan Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-3">
            1. Select Renewal Plan Tier
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plans.map((p) => {
              const isSelected = p.id === selectedPlanId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlanId(p.id);
                    setCouponApplied(null);
                  }}
                  className={`text-left p-4 rounded border transition-all ${
                    isSelected
                      ? 'border-[#C8A96B] bg-[#C8A96B]/10 ring-1 ring-[#C8A96B]'
                      : 'border-[#262626] bg-[#161616] hover:border-[#383838]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#F5F5F0]">{p.name}</span>
                    <span className="text-xs font-mono text-[#C8A96B]">{p.durationDays} Days</span>
                  </div>
                  <span className="text-base font-black text-[#F5F5F0]">
                    {formatCurrency(p.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-2.5">
            2. Choose Payment Method
          </label>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { id: 'UPI', label: 'Instant UPI / QR', desc: 'GPay, PhonePe, Paytm' },
              { id: 'ONLINE', label: 'Razorpay Gateway', desc: 'Credit / Debit Card' },
              { id: 'CASH', label: 'Concierge Desk', desc: 'Pay at front desk' },
            ].map((m) => {
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded border text-left transition-colors ${
                    isSelected
                      ? 'border-[#C8A96B] bg-[#C8A96B]/10'
                      : 'border-[#262626] bg-[#161616] hover:border-[#333]'
                  }`}
                >
                  <strong className="text-[#F5F5F0] block text-xs">{m.label}</strong>
                  <span className="text-[10px] text-[#7E7E78]">{m.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coupon Code Section */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-2">
            3. Apply Promotional Code
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-2.5 h-4 w-4 text-[#7E7E78]" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Try FITLIFE20 or WELCOME1000"
                className="w-full rounded bg-[#101010] border border-[#282828] pl-9 pr-3 py-2 text-xs text-[#F5F5F0] uppercase font-mono focus:outline-none focus:border-[#C8A96B]"
              />
            </div>
            {couponApplied ? (
              <button
                type="button"
                onClick={() => {
                  setCouponApplied(null);
                  setCouponCode('');
                }}
                className="px-3.5 py-2 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs"
              >
                Clear
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isPending || !couponCode.trim()}
                className="px-4 py-2 rounded bg-[#242424] hover:bg-[#333] border border-[#3A3A3A] text-xs font-medium text-[#F5F5F0] disabled:opacity-50"
              >
                {isPending ? 'Validating...' : 'Apply Code'}
              </button>
            )}
          </div>
          {couponApplied && (
            <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Coupon {couponApplied.code} applied! Saved {formatCurrency(couponApplied.discountAmount)}.</span>
            </p>
          )}
          {couponError && <p className="mt-1.5 text-xs text-rose-400">{couponError}</p>}
        </div>
      </div>

      {/* Right Column: Order Summary Card */}
      <div className="lg:col-span-5 flex flex-col justify-between card-luxury p-6 bg-[#151515] border-[#282828]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96B]">
            Renewal Order Summary
          </span>
          <h3 className="text-xl font-bold text-[#F5F5F0] mt-1 mb-4">
            {selectedPlan?.name}
          </h3>

          <div className="space-y-3 text-xs border-b border-[#242424] pb-5">
            <div className="flex justify-between text-[#A0A09B]">
              <span>Duration Added</span>
              <span className="text-[#F5F5F0] font-medium">{selectedPlan?.durationDays} Days</span>
            </div>
            <div className="flex justify-between text-[#A0A09B]">
              <span>Base Renewal Rate</span>
              <span className="text-[#F5F5F0] font-medium">{formatCurrency(originalPrice)}</span>
            </div>
            {couponApplied && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Discount ({couponApplied.code})</span>
                <span>-{formatCurrency(couponApplied.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#A0A09B]">
              <span>Method</span>
              <span className="text-[#C8A96B] font-mono">{paymentMethod}</span>
            </div>
          </div>

          <div className="pt-4 flex items-baseline justify-between mb-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#A0A09B]">Total Payable</span>
              <p className="text-[10px] text-[#7E7E78]">Server verified price</p>
            </div>
            <span className="text-2xl font-black text-[#C8A96B]">
              {formatCurrency(finalPrice)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExecuteRenewal}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold text-xs uppercase tracking-wider py-3.5 px-4 transition-all disabled:opacity-50"
        >
          {isPending ? 'Securing Transaction...' : `Complete Renewal & Pay ${formatCurrency(finalPrice)}`}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
