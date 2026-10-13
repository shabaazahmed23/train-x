import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Utensils, AlertTriangle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MemberDietPage() {
  const session = await requireAuth();

  const profile = await prisma.memberProfile.findUnique({
    where: { userId: session.id },
    include: {
      dietPlans: {
        where: { isActive: true },
        take: 1,
        include: { trainer: true },
      },
    },
  });

  const dietPlan = profile?.dietPlans[0];
  const meals: Array<{ time: string; name: string; items: string }> = dietPlan?.meals
    ? JSON.parse(dietPlan.meals)
    : [];

  return (
    <div className="space-y-8">
      <div className="border-b border-[#222] pb-6">
        <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
          Nutritional Blueprint
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F0]">Nutritional Guidance & Meal Schedule</h1>
        <p className="text-xs text-[#8E8E88]">
          Personalized caloric breakdown and timing tailored for muscular recovery.
        </p>
      </div>

      {/* Mandatory Medical Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded bg-[#161616] border border-[#C8A96B]/30 text-xs text-[#A0A09B]">
        <AlertTriangle className="h-5 w-5 text-[#C8A96B] shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#F5F5F0]">Educational Guidance Disclaimer: </strong>
          {dietPlan?.disclaimer ||
            'Diet charts are for informational guidance only. Medical nutrition plans or clinical therapy require consultation with a licensed clinical dietitian or physician.'}
        </p>
      </div>

      {!dietPlan ? (
        <div className="card-luxury p-12 text-center space-y-3 bg-[#161616] border-[#262626]">
          <Utensils className="mx-auto h-12 w-12 text-[#7E7E78]" />
          <h3 className="text-base font-bold text-[#F5F5F0]">No Diet Chart Active</h3>
          <p className="text-xs text-[#8E8E88] max-w-sm mx-auto">
            Your coach has not assigned a personalized nutritional chart yet. Ask your trainer during your next session!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Daily Macros Card */}
          <div className="card-luxury p-6 bg-[#161616] border-[#262626] space-y-4">
            <div className="flex items-center justify-between border-b border-[#242424] pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#F5F5F0]">{dietPlan.title}</h2>
                {dietPlan.trainer && (
                  <span className="text-xs text-[#C8A96B]">
                    Supervised by Coach {dietPlan.trainer.name}
                  </span>
                )}
              </div>
              <span className="text-sm font-mono font-bold text-[#C8A96B] bg-[#C8A96B]/15 px-3 py-1 rounded border border-[#C8A96B]/40">
                {dietPlan.dailyCalories} kcal / day
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded bg-[#121212] border border-[#242424]">
                <span className="text-[10px] text-[#7E7E78] block">Protein</span>
                <strong className="text-base font-bold text-[#F5F5F0]">{dietPlan.proteinGrams}g</strong>
              </div>
              <div className="p-3 rounded bg-[#121212] border border-[#242424]">
                <span className="text-[10px] text-[#7E7E78] block">Carbohydrates</span>
                <strong className="text-base font-bold text-[#F5F5F0]">{dietPlan.carbsGrams}g</strong>
              </div>
              <div className="p-3 rounded bg-[#121212] border border-[#242424]">
                <span className="text-[10px] text-[#7E7E78] block">Fats</span>
                <strong className="text-base font-bold text-[#F5F5F0]">{dietPlan.fatGrams}g</strong>
              </div>
            </div>
          </div>

          {/* Meals Schedule */}
          <div className="card-luxury p-6 bg-[#161616] border-[#262626] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#A0A09B]">
              Prescribed Meal Timing
            </h3>

            <div className="space-y-3">
              {meals.map((meal, index) => (
                <div
                  key={index}
                  className="p-4 rounded bg-[#121212] border border-[#242424] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[#C8A96B] font-mono text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {meal.time}
                    </span>
                    <strong className="font-bold uppercase tracking-wider">{meal.name}</strong>
                  </div>
                  <p className="text-sm text-[#F5F5F0] leading-relaxed pt-1">{meal.items}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
