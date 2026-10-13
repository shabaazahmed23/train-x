import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import { adminSavePlanAction, adminTogglePlanStatusAction } from '@/lib/actions';
import { Layers, Plus, Check, Star, Eye, EyeOff } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPlansPage() {
  const plans = await prisma.membershipPlan.findMany({
    orderBy: { price: 'asc' },
    include: {
      _count: { select: { memberships: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
            Plan Configuration
          </span>
          <h1 className="text-2xl font-black text-[#F5F5F0]">Membership Plans</h1>
          <p className="text-xs text-[#8E8E88]">
            Configure tiers, pricing, duration, and personal training inclusions.
          </p>
        </div>

        <details className="relative group">
          <summary className="list-none cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase tracking-wider transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Plan</span>
          </summary>

          <div className="absolute right-0 top-12 z-50 w-96 card-luxury p-6 bg-[#161616] border-[#333] shadow-2xl">
            <form
              action={async (fd) => {
                'use server';
                await adminSavePlanAction(fd);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[#A0A09B] mb-1">Plan Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Diamond Executive"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Slug (URL friendly)</label>
                <input
                  name="slug"
                  required
                  placeholder="diamond-executive"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A0A09B] mb-1">Price (₹ INR)</label>
                  <input
                    name="price"
                    type="number"
                    required
                    placeholder="18999"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="block text-[#A0A09B] mb-1">Duration (Days)</label>
                  <input
                    name="durationDays"
                    type="number"
                    required
                    defaultValue="180"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">PT Sessions Included</label>
                <input
                  name="ptSessionsIncluded"
                  type="number"
                  defaultValue="4"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Summary of access and privileges..."
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Features (One per line)</label>
                <textarea
                  name="features"
                  rows={3}
                  placeholder="Cardio arena access&#10;Sauna privileges&#10;Private locker"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="isPopular" value="true" className="text-[#C8A96B]" />
                  <span>Popular Badge</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="isPublished" value="true" defaultChecked className="text-[#C8A96B]" />
                  <span>Publish Publicly</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold uppercase text-[11px]"
              >
                Save & Publish Plan
              </button>
            </form>
          </div>
        </details>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="card-luxury p-12 text-center border-[#262626] bg-[#161616] flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center text-[#C8A96B] mb-4">
            <Plus className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[#F5F5F0]">No membership plans available. Create your first plan.</h3>
          <p className="text-xs text-[#8E8E88] mt-2 max-w-md">
            Click &quot;Create New Plan&quot; above to establish your membership tiers such as Monthly, Quarterly, or Annual packages.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => {
          const features: string[] = p.features ? JSON.parse(p.features) : [];
          return (
            <div
              key={p.id}
              className={`card-luxury p-6 flex flex-col justify-between ${
                p.isPopular ? 'border-[#C8A96B]/60 ring-1 ring-[#C8A96B]/30' : 'border-[#262626]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#C8A96B] uppercase">
                    {p.durationDays} Days Duration
                  </span>
                  {p.isPopular && (
                    <span className="rounded bg-[#C8A96B] px-2 py-0.5 text-[9px] font-extrabold uppercase text-black">
                      Most Popular
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[#F5F5F0]">{p.name}</h3>
                <p className="text-xs text-[#8E8E88] mt-1 mb-3">{p.description}</p>

                <div className="my-3 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#C8A96B]">{formatCurrency(p.price)}</span>
                  <span className="text-xs text-[#7E7E78]">/ {p.durationDays}d</span>
                </div>

                <div className="border-t border-[#222] pt-3 mb-4 space-y-1.5 text-xs text-[#A0A09B]">
                  <p>Inclusions: <strong className="text-[#F5F5F0]">{features.length} Features</strong></p>
                  <p>Coaching: <strong className="text-[#F5F5F0]">{p.ptSessionsIncluded} PT Sessions</strong></p>
                  <p>Active Enrollments: <strong className="text-[#C8A96B]">{p._count.memberships} Members</strong></p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#242424] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#7E7E78]">
                  Status: {p.isPublished ? 'Published' : 'Draft'}
                </span>
                <form
                  action={async () => {
                    'use server';
                    await adminTogglePlanStatusAction(p.id, !p.isPublished);
                  }}
                >
                  <button
                    type="submit"
                    className="flex items-center gap-1 text-[11px] text-[#C8A96B] hover:underline"
                  >
                    {p.isPublished ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Publish
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
