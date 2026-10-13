import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DEFAULT_OFFERS, DEFAULT_SETTINGS, withTimeout } from '@/lib/data-defaults';
import { Tag, Sparkles, Clock, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OffersPage() {
  const session = await getSession();
  let offers: any[] = DEFAULT_OFFERS;
  let settings: any = DEFAULT_SETTINGS;

  try {
    const dbPromise = Promise.all([
      prisma.offer.findMany({
        where: { isActive: true, isPublic: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.gymSettings.findUnique({ where: { id: 'default-settings' } }),
    ]);
    const results = await withTimeout(dbPromise, 2500, null);
    if (results) {
      if (results[0] && results[0].length > 0) offers = results[0];
      if (results[1]) settings = results[1];
    }
  } catch (error) {
    console.error('Database query error in OffersPage:', error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#111111]">
      <Navbar session={session} />

      <main className="flex-1">
        <section className="py-20 bg-[#141414] border-b border-[#222222]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
              Seasonal Privileges
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F0] mt-2 mb-4">
              Promotional Vouchers & Privileges
            </h1>
            <p className="text-base text-[#A0A09B] leading-relaxed">
              Apply these verified promotional codes during checkout or membership renewal to receive preferential pricing.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {offers.length === 0 ? (
              <div className="card-luxury p-12 text-center border-dashed border-[#2A2A2A] bg-[#161616]/60 max-w-xl mx-auto space-y-3">
                <Tag className="h-10 w-10 text-[#C8A96B] mx-auto opacity-40 mb-2" />
                <span className="text-xs uppercase font-mono tracking-widest text-[#C8A96B]">Promotions</span>
                <h3 className="text-lg font-bold text-[#F5F5F0]">No Promotional Offers Active</h3>
                <p className="text-xs text-[#8E8E88] leading-relaxed">
                  There are currently no public promotional vouchers active. Seasonal promotions and membership benefits are published here regularly.
                </p>
                <div className="pt-2">
                  <Link
                    href="/membership"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    View Membership Tiers &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {offers.map((offer) => (
                  <div key={offer.id} className="card-luxury p-6 flex flex-col justify-between border-[#C8A96B]/30 bg-[#171717] relative">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#C8A96B] bg-[#C8A96B]/15 px-3 py-1 rounded border border-[#C8A96B]/40">
                          {offer.code}
                        </span>
                        <span className="text-[10px] text-[#A0A09B] flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Valid till {formatDate(offer.endDate)}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-[#F5F5F0]">{offer.title}</h3>
                        <p className="text-xs text-[#8E8E88] mt-1 leading-relaxed">
                          {offer.description}
                        </p>
                      </div>

                      <div className="bg-[#121212] p-3 rounded border border-[#242424] text-xs space-y-1 text-[#A0A09B]">
                        <div className="flex justify-between">
                          <span>Benefit:</span>
                          <strong className="text-[#C8A96B]">
                            {offer.discountType === 'PERCENTAGE'
                              ? `${offer.discountValue}% Discount`
                              : `Flat ${formatCurrency(offer.discountValue)} Off`}
                          </strong>
                        </div>
                        {Number(offer.minOrderAmount) > 0 && (
                          <div className="flex justify-between">
                            <span>Min Spend:</span>
                            <span className="text-[#F5F5F0]">{formatCurrency(offer.minOrderAmount)}</span>
                          </div>
                        )}
                        {offer.maxDiscountAmount && (
                          <div className="flex justify-between">
                            <span>Max Discount:</span>
                            <span className="text-[#F5F5F0]">{formatCurrency(offer.maxDiscountAmount)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-[#242424]">
                      <Link
                        href={session ? `/member/renew?coupon=${offer.code}` : `/register?coupon=${offer.code}`}
                        prefetch={true}
                        className="w-full flex items-center justify-center gap-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold text-xs uppercase tracking-wider py-2.5 px-4 transition-colors"
                      >
                        Use Coupon Now <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer gymInfo={settings} />
    </div>
  );
}
