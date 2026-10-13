import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Dumbbell, Clock, Flame, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MemberWorkoutsPage() {
  const session = await requireAuth();

  const profile = await prisma.memberProfile.findUnique({
    where: { userId: session.id },
    include: {
      workoutPlans: {
        where: { isActive: true },
        include: {
          exercises: {
            orderBy: { orderIndex: 'asc' },
          },
          trainer: true,
        },
      },
    },
  });

  const workoutPlan = profile?.workoutPlans[0];
  const exercises = workoutPlan?.exercises || [];

  // Group exercises by dayOfWeek
  const exercisesByDay = exercises.reduce((acc: Record<string, typeof exercises>, ex) => {
    acc[ex.dayOfWeek] = acc[ex.dayOfWeek] || [];
    acc[ex.dayOfWeek].push(ex);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="border-b border-[#222] pb-6">
        <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
          Athletic Conditioning
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F0]">Assigned Training Protocol</h1>
        <p className="text-xs text-[#8E8E88]">
          Review your prescribed sets, repetitions, rest intervals, and technique guidance.
        </p>
      </div>

      {!workoutPlan ? (
        <div className="card-luxury p-12 text-center space-y-3 bg-[#161616] border-[#262626]">
          <Dumbbell className="mx-auto h-12 w-12 text-[#7E7E78]" />
          <h3 className="text-base font-bold text-[#F5F5F0]">No Active Routine Assigned</h3>
          <p className="text-xs text-[#8E8E88] max-w-sm mx-auto">
            Your master coach will design and assign your custom periodized workout split during your initial assessment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card-luxury p-6 bg-[#161616] border-[#262626] space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#F5F5F0]">{workoutPlan.title}</h2>
              {workoutPlan.trainer && (
                <span className="text-xs text-[#C8A96B] font-medium">
                  Prescribed by Coach {workoutPlan.trainer.name}
                </span>
              )}
            </div>
            {workoutPlan.description && (
              <p className="text-xs text-[#8E8E88] leading-relaxed">{workoutPlan.description}</p>
            )}
            <span className="text-[10px] text-[#7E7E78] block">
              Active since {formatDate(workoutPlan.startDate)}
            </span>
          </div>

          <div className="space-y-6">
            {Object.entries(exercisesByDay).map(([day, dayExercises]) => (
              <div key={day} className="card-luxury p-6 bg-[#161616] border-[#262626] space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#C8A96B] border-b border-[#242424] pb-2">
                  {day}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dayExercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-4 rounded bg-[#121212] border border-[#242424] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-sm text-[#F5F5F0]">{ex.exerciseName}</strong>
                        <span className="font-mono text-[#C8A96B] font-bold text-xs">
                          {ex.sets} Sets &times; {ex.reps}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#7E7E78]">
                        <Clock className="h-3 w-3" />
                        <span>Rest: {ex.restSeconds} seconds</span>
                      </div>

                      {ex.instructions && (
                        <p className="text-[11px] text-[#8E8E88] pt-1 border-t border-[#1F1F1F]">
                          {ex.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
