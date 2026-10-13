'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Calculator, Check, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { validateCouponServer } from '@/lib/actions';

interface PlanOption {
  id: string;
  name: string;
  slug: string;
  price: number;
  durationDays: number;
  durationType: string;
  ptSessionsIncluded: number;
}

interface PricingCalculatorProps {
  plans: PlanOption[];
}

export function PricingCalculator({ plans }: PricingCalculatorProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans?.[0]?.id || '');
  const [extraPtSessions, setExtraPtSessions] = useState<number>(0);
  const [includeVipLocker, setIncludeVipLocker] = useState<boolean>(false);
  const [includeSaunaPass, setIncludeSaunaPass] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!plans || plans.length === 0) {
    return (
      <div className="card-luxury p-10 text-center border-dashed border-[#2A2A2A] bg-[#161616]/60 max-w-xl mx-auto space-y-3">
        <Calculator className="h-8 w-8 text-[#C8A96B] mx-auto opacity-50" />
        <h3 className="text-base font-bold text-[#F5F5F0]">Estimator Available Once Plans Are Configured</h3>
        <p className="text-xs text-[#8E8E88] leading-relaxed">
          The interactive price estimator activates automatically as soon as membership packages are published by club administration.
        </p>
      </div>
    );
  }

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  // Extra add-on rates
  const ptRatePerSession = 1000;
  const vipLockerRate = 1500;
  const saunaPassRate = 1200;

  const basePrice = selectedPlan ? Number(selectedPlan.price) : 0;
  const ptAddonCost = extraPtSessions * ptRatePerSession;
  const lockerAddonCost = includeVipLocker ? vipLockerRate : 0;
  const saunaAddonCost = includeSaunaPass ? saunaPassRate : 0;

  const subtotal = basePrice + ptAddonCost + lockerAddonCost + saunaAddonCost;
  const discount = couponApplied ? couponApplied.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponError(null);

    startTransition(async () => {
      const result = await validateCouponServer(couponCode, subtotal);
      if (result.valid) {
        setCouponApplied({
          code: result.code || couponCode.toUpperCase(),
          discountAmount: result.discountAmount,
        });
        setCouponError(null);
      } else {
        setCouponApplied(null);
        setCouponError(result.error || 'Invalid coupon code');
      }
    });
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError(null);
  };

  if (!plans || plans.length === 0) {
    return null;
  }

  return (
    <div className="card-luxury p-6 sm:p-8 border-[#2D2D2D] bg-[#161616]/90 shadow-2xl">
      <div className="flex items-center gap-3 mb-6 border-b border-[#242424] pb-4">
        <div className="h-10 w-10 rounded bg-[#C8A96B]/10 border border-[#C8A96B]/40 flex items-center justify-center text-[#C8A96B]">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#F5F5F0]">
            Interactive Membership Price Estimator
          </h3>
          <p className="text-xs text-[#A0A09B]">
            Customize your membership tier, personal training, and luxury privileges in real-time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Configurator Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Plan Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-2.5">
              1. Select Membership Plan
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
                      setCouponApplied(null); // Reset coupon to re-verify against new subtotal
                    }}
                    className={`text-left p-3.5 rounded border transition-all ${
                      isSelected
                        ? 'border-[#C8A96B] bg-[#C8A96B]/10 ring-1 ring-[#C8A96B]/40'
                        : 'border-[#282828] bg-[#1A1A1A] hover:border-[#383838]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-[#F5F5F0]">{p.name}</span>
                      {isSelected && <Check className="h-4 w-4 text-[#C8A96B]" />}
                    </div>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-[#C8A96B] font-bold">
                        {formatCurrency(p.price)}
                      </span>
                      <span className="text-[#7E7E78]">{p.durationDays} Days</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personal Training Add-on */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-2.5">
              2. Additional Personal Training Sessions
            </label>
            <div className="flex flex-wrap gap-2.5">
              {[0, 2, 5, 10].map((count) => {
                const isSelected = extraPtSessions === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      setExtraPtSessions(count);
                      setCouponApplied(null);
                    }}
                    className={`px-4 py-2 rounded text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'border-[#C8A96B] bg-[#C8A96B] text-black font-semibold'
                        : 'border-[#282828] bg-[#1A1A1A] text-[#A0A09B] hover:text-white'
                    }`}
                  >
                    {count === 0 ? 'None (Included Only)' : `+${count} Sessions (+${formatCurrency(count * ptRatePerSession)})`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Luxury Add-ons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-2.5">
              3. Luxury Club Add-ons
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded border border-[#282828] bg-[#1A1A1A] cursor-pointer hover:border-[#333333] transition-colors">
                <input
                  type="checkbox"
                  checked={includeVipLocker}
                  onChange={(e) => {
                    setIncludeVipLocker(e.target.checked);
                    setCouponApplied(null);
                  }}
                  className="rounded border-[#444] bg-[#111] text-[#C8A96B] focus:ring-[#C8A96B]"
                />
                <div className="flex-1 text-xs">
                  <span className="text-[#F5F5F0] font-medium">VIP Dedicated Locker Suite & Laundry</span>
                  <p className="text-[#7E7E78]">Private personal locker suite with daily complimentary apparel wash</p>
                </div>
                <span className="text-xs font-semibold text-[#C8A96B]">+{formatCurrency(vipLockerRate)}</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded border border-[#282828] bg-[#1A1A1A] cursor-pointer hover:border-[#333333] transition-colors">
                <input
                  type="checkbox"
                  checked={includeSaunaPass}
                  onChange={(e) => {
                    setIncludeSaunaPass(e.target.checked);
                    setCouponApplied(null);
                  }}
                  className="rounded border-[#444] bg-[#111] text-[#C8A96B] focus:ring-[#C8A96B]"
                />
                <div className="flex-1 text-xs">
                  <span className="text-[#F5F5F0] font-medium">Infrared Sauna & Cryotherapy Recovery Pass</span>
                  <p className="text-[#7E7E78]">Unlimited access to Finnish saunas, cold plunge, and pneumatic compression</p>
                </div>
                <span className="text-xs font-semibold text-[#C8A96B]">+{formatCurrency(saunaPassRate)}</span>
              </label>
            </div>
          </div>

          {/* Coupon Code Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-2">
              Promotional Coupon Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-[#7E7E78]" />
                <input
                  type="text"
                  placeholder="Try FITLIFE20 or WELCOME1000"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full rounded bg-[#111111] border border-[#282828] pl-9 pr-3 py-2 text-xs text-[#F5F5F0] uppercase tracking-wider focus:outline-none focus:border-[#C8A96B]"
                />
              </div>
              {couponApplied ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="px-3.5 py-2 rounded bg-rose-950/40 border border-rose-800/50 text-rose-400 text-xs font-medium hover:bg-rose-900/50"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isPending || !couponCode.trim()}
                  className="px-4 py-2 rounded bg-[#242424] hover:bg-[#333333] border border-[#3A3A3A] text-xs font-medium text-[#F5F5F0] disabled:opacity-50 transition-colors"
                >
                  {isPending ? 'Verifying...' : 'Apply Code'}
                </button>
              )}
            </div>
            {couponApplied && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Coupon {couponApplied.code} verified! Saved {formatCurrency(couponApplied.discountAmount)}.</span>
              </div>
            )}
            {couponError && (
              <p className="mt-2 text-xs text-rose-400">{couponError}</p>
            )}
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#121212] p-6 rounded-lg border border-[#262626]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96B]">
              Price Breakdown
            </span>
            <h4 className="text-xl font-bold text-[#F5F5F0] mt-1 mb-4">
              {selectedPlan?.name}
            </h4>

            <div className="space-y-3 text-xs border-b border-[#222222] pb-5">
              <div className="flex justify-between text-[#A0A09B]">
                <span>Base Plan Duration</span>
                <span className="text-[#F5F5F0] font-medium">{selectedPlan?.durationDays} Days</span>
              </div>
              <div className="flex justify-between text-[#A0A09B]">
                <span>Base Plan Price</span>
                <span className="text-[#F5F5F0] font-medium">{formatCurrency(basePrice)}</span>
              </div>
              {extraPtSessions > 0 && (
                <div className="flex justify-between text-[#A0A09B]">
                  <span>Extra Coaching ({extraPtSessions}x)</span>
                  <span className="text-[#F5F5F0] font-medium">+{formatCurrency(ptAddonCost)}</span>
                </div>
              )}
              {includeVipLocker && (
                <div className="flex justify-between text-[#A0A09B]">
                  <span>VIP Locker Suite</span>
                  <span className="text-[#F5F5F0] font-medium">+{formatCurrency(lockerAddonCost)}</span>
                </div>
              )}
              {includeSaunaPass && (
                <div className="flex justify-between text-[#A0A09B]">
                  <span>Recovery Sauna Pass</span>
                  <span className="text-[#F5F5F0] font-medium">+{formatCurrency(saunaAddonCost)}</span>
                </div>
              )}
              {couponApplied && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Discount ({couponApplied.code})</span>
                  <span>-{formatCurrency(couponApplied.discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-baseline justify-between mb-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#A0A09B]">Total Payable</span>
                <p className="text-[10px] text-[#70706B]">Inclusive of all club privileges & taxes</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#C8A96B] tracking-tight">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/register?plan=${selectedPlan?.slug || ''}${couponApplied ? `&coupon=${couponApplied.code}` : ''}`}
            className="w-full flex items-center justify-center gap-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-[#111111] font-bold text-xs uppercase tracking-wider py-3.5 px-4 transition-all"
          >
            Enroll With This Selection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
