import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ClipboardList, Plus, Dumbbell, User } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminWorkoutsPage() {
  const [templates, memberPlans] = await Promise.all([
    prisma.workoutTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.workoutPlan.findMany({
      include: {
        member: { include: { user: true } },
        trainer: true,
        exercises: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  async function createTemplateAction(formData: FormData) {
    'use server';
    const title = (formData.get('title') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const daysPerWeek = parseInt((formData.get('daysPerWeek') as string) || '3', 10);
    const exercisesRaw = formData.get('exercises') as string;

    if (!title) return;

    const exercises = JSON.stringify(
      exercisesRaw
        ? exercisesRaw.split('\n').map((line) => {
            const parts = line.split(',');
            return {
              name: parts[0]?.trim() || 'Exercise',
              sets: parts[1]?.trim() || 3,
              reps: parts[2]?.trim() || '10-12',
            };
          })
        : []
    );

    await prisma.workoutTemplate.create({
      data: {
        title,
        description,
        daysPerWeek,
        exercises,
      },
    });

    revalidatePath('/admin/workouts');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
            Exercise Prescriptions
          </span>
          <h1 className="text-2xl font-black text-[#F5F5F0]">Workout Templates & Member Routines</h1>
          <p className="text-xs text-[#8E8E88]">
            Author reusable training protocols and oversee personalized member assignments.
          </p>
        </div>

        <details className="relative group">
          <summary className="list-none cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase tracking-wider transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>New Workout Template</span>
          </summary>

          <div className="absolute right-0 top-12 z-50 w-96 card-luxury p-6 bg-[#161616] border-[#333] shadow-2xl">
            <h3 className="text-sm font-bold text-[#F5F5F0] mb-4">Build Workout Template</h3>
            <form action={createTemplateAction} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A0A09B] mb-1">Routine Title</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Upper-Lower Athletic Split"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Days Per Week</label>
                <input
                  name="daysPerWeek"
                  type="number"
                  defaultValue="4"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Overview & Goal</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Focus on compound posterior chain development..."
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">
                  Exercises (Format: Name, Sets, Reps)
                </label>
                <textarea
                  name="exercises"
                  rows={4}
                  placeholder="Barbell Squat, 4, 8-10&#10;Romanian Deadlift, 3, 10-12&#10;Standing Calf Raise, 4, 15"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold uppercase text-[11px]"
              >
                Save Workout Template
              </button>
            </form>
          </div>
        </details>
      </div>

      {/* Templates Row */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#A0A09B] mb-4">
          Master Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="card-luxury p-5 bg-[#161616] border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#F5F5F0]">{tmpl.title}</h3>
                <span className="text-[10px] font-mono text-[#C8A96B] bg-[#C8A96B]/15 px-2 py-0.5 rounded border border-[#C8A96B]/30">
                  {tmpl.daysPerWeek} Days/Wk
                </span>
              </div>
              <p className="text-xs text-[#8E8E88]">{tmpl.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Member Assigned Plans */}
      <div className="pt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#A0A09B] mb-4">
          Assigned Member Training Plans
        </h2>
        <div className="card-luxury overflow-hidden bg-[#161616] border-[#262626]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222] text-[#8E8E88] bg-[#121212]">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Plan Title</th>
                  <th className="py-3 px-4">Supervising Coach</th>
                  <th className="py-3 px-4">Exercises</th>
                  <th className="py-3 px-4">Assigned On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {memberPlans.map((mp) => (
                  <tr key={mp.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#F5F5F0]">
                      {mp.member.user.name}
                      <span className="text-[10px] text-[#7E7E78] block font-mono">{mp.member.membershipNumber}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#C8A96B]">{mp.title}</td>
                    <td className="py-3 px-4 text-[#A0A09B]">{mp.trainer?.name || 'Unassigned'}</td>
                    <td className="py-3 px-4 text-[#A0A09B]">{mp.exercises.length} prescribed movements</td>
                    <td className="py-3 px-4 text-[#7E7E78]">{formatDate(mp.startDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
