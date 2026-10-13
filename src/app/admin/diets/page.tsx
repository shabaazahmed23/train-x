import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Utensils, AlertTriangle, User, Plus } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminDietsPage() {
  const [dietPlans, members, trainers] = await Promise.all([
    prisma.dietPlan.findMany({
      include: {
        member: { include: { user: true } },
        trainer: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.memberProfile.findMany({ include: { user: true } }),
    prisma.trainer.findMany(),
  ]);

  async function createDietPlanAction(formData: FormData) {
    'use server';
    const memberId = formData.get('memberId') as string;
    const trainerId = formData.get('trainerId') as string;
    const title = (formData.get('title') as string)?.trim();
    const calories = parseInt((formData.get('calories') as string) || '2200', 10);
    const protein = parseInt((formData.get('protein') as string) || '150', 10);
    const carbs = parseInt((formData.get('carbs') as string) || '200', 10);
    const fat = parseInt((formData.get('fat') as string) || '60', 10);
    const mealsRaw = formData.get('meals') as string;

    if (!memberId || !title) return;

    const meals = JSON.stringify(
      mealsRaw
        ? mealsRaw.split('\n').map((line) => {
            const parts = line.split('|');
            return {
              time: parts[0]?.trim() || 'Meal',
              name: parts[1]?.trim() || 'Course',
              items: parts[2]?.trim() || line,
            };
          })
        : []
    );

    await prisma.dietPlan.create({
      data: {
        memberId,
        trainerId: trainerId || null,
        title,
        dailyCalories: calories,
        proteinGrams: protein,
        carbsGrams: carbs,
        fatGrams: fat,
        meals,
      },
    });

    revalidatePath('/admin/diets');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
            Nutritional Protocols
          </span>
          <h1 className="text-2xl font-black text-[#F5F5F0]">Diet Charts & Guidance</h1>
          <p className="text-xs text-[#8E8E88]">
            Informational macronutrient breakdowns and daily meal timing schedules.
          </p>
        </div>

        <details className="relative group">
          <summary className="list-none cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase tracking-wider transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>Assign Diet Plan</span>
          </summary>

          <div className="absolute right-0 top-12 z-50 w-96 card-luxury p-6 bg-[#161616] border-[#333] shadow-2xl">
            <h3 className="text-sm font-bold text-[#F5F5F0] mb-4">Assign Member Diet Plan</h3>
            <form action={createDietPlanAction} className="space-y-3 text-xs">
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
              <div>
                <label className="block text-[#A0A09B] mb-1">Supervising Coach</label>
                <select
                  name="trainerId"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                >
                  <option value="">No specific coach</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Chart Title</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Lean Bulk & Glycogen Replenishment"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#A0A09B] mb-1">Calories (kcal)</label>
                  <input
                    name="calories"
                    type="number"
                    defaultValue="2400"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
                <div>
                  <label className="block text-[#A0A09B] mb-1">Protein (g)</label>
                  <input
                    name="protein"
                    type="number"
                    defaultValue="170"
                    className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">
                  Meals (Format: Time | Meal Name | Items)
                </label>
                <textarea
                  name="meals"
                  rows={4}
                  placeholder="08:00 AM | Breakfast | Oats with almond milk & berries&#10;01:30 PM | Lunch | Grilled chicken breast, rice & greens"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold uppercase text-[11px]"
              >
                Assign Nutritional Chart
              </button>
            </form>
          </div>
        </details>
      </div>

      {/* Medical Legal Disclaimer Notice */}
      <div className="flex items-start gap-3 p-4 rounded bg-[#1A1A1A] border border-[#C8A96B]/30 text-xs text-[#A0A09B]">
        <AlertTriangle className="h-5 w-5 text-[#C8A96B] shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#F5F5F0]">Important Medical Disclaimer: </strong>
          All diet and caloric charts generated through FITLIFE are educational and fitness guidance only. Members with underlying metabolic disorders, endocrine issues, or kidney disease must receive clinical meal prescriptions from a registered clinical dietitian.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dietPlans.map((dp) => {
          const meals: Array<{ time: string; name: string; items: string }> = dp.meals
            ? JSON.parse(dp.meals)
            : [];
          return (
            <div key={dp.id} className="card-luxury p-6 bg-[#161616] border-[#262626] space-y-4">
              <div className="flex items-center justify-between border-b border-[#242424] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#F5F5F0]">{dp.title}</h3>
                  <span className="text-xs text-[#A0A09B]">
                    Member: <strong className="text-[#F5F5F0]">{dp.member.user.name}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#C8A96B] bg-[#C8A96B]/15 px-2 py-0.5 rounded border border-[#C8A96B]/30">
                  {dp.dailyCalories || 2200} kcal/day
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-[#121212] border border-[#222]">
                  <span className="text-[10px] text-[#7E7E78] block">Protein</span>
                  <strong className="text-[#F5F5F0]">{dp.proteinGrams || 150}g</strong>
                </div>
                <div className="p-2 rounded bg-[#121212] border border-[#222]">
                  <span className="text-[10px] text-[#7E7E78] block">Carbs</span>
                  <strong className="text-[#F5F5F0]">{dp.carbsGrams || 200}g</strong>
                </div>
                <div className="p-2 rounded bg-[#121212] border border-[#222]">
                  <span className="text-[10px] text-[#7E7E78] block">Fats</span>
                  <strong className="text-[#F5F5F0]">{dp.fatGrams || 60}g</strong>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E7E78] block">
                  Daily Timing:
                </span>
                {meals.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-[#1A1A1A] border border-[#242424] text-xs">
                    <div className="flex items-center justify-between text-[#C8A96B] font-mono text-[11px] mb-1">
                      <span>{m.time}</span>
                      <span className="font-semibold">{m.name}</span>
                    </div>
                    <p className="text-[#D1D1CB] text-[11px]">{m.items}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
