import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Megaphone, Plus, Bell } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { AnnouncementAudience } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  });

  async function createAnnouncementAction(formData: FormData) {
    'use server';
    const title = (formData.get('title') as string)?.trim();
    const content = (formData.get('content') as string)?.trim();
    const targetAudience = (formData.get('targetAudience') as AnnouncementAudience) || AnnouncementAudience.ALL;

    if (!title || !content) return;

    await prisma.announcement.create({
      data: {
        title,
        content,
        targetAudience,
      },
    });

    revalidatePath('/admin/announcements');
    revalidatePath('/member');
    revalidatePath('/');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
            Broadcast System
          </span>
          <h1 className="text-2xl font-black text-[#F5F5F0]">Club Announcements & Notices</h1>
          <p className="text-xs text-[#8E8E88]">
            Publish gym closures, clinic events, masterclasses, and maintenance notices.
          </p>
        </div>

        <details className="relative group">
          <summary className="list-none cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase tracking-wider transition-colors">
            <Plus className="h-3.5 w-3.5" />
            <span>Publish Notice</span>
          </summary>

          <div className="absolute right-0 top-12 z-50 w-96 card-luxury p-6 bg-[#161616] border-[#333] shadow-2xl">
            <h3 className="text-sm font-bold text-[#F5F5F0] mb-4">Post Club Announcement</h3>
            <form action={createAnnouncementAction} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A0A09B] mb-1">Headline</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Olympic Lifting Workshop This Saturday"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Audience</label>
                <select
                  name="targetAudience"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                >
                  <option value="ALL">All Visitors & Members</option>
                  <option value="MEMBERS_ONLY">Members Only</option>
                </select>
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1">Announcement Body</label>
                <textarea
                  name="content"
                  rows={4}
                  required
                  placeholder="Details of schedule, timings, and participation..."
                  className="w-full rounded bg-[#111] border border-[#282828] px-3 py-2 text-[#F5F5F0]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold uppercase text-[11px]"
              >
                Broadcast to Club
              </button>
            </form>
          </div>
        </details>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map((a) => (
          <div key={a.id} className="card-luxury p-6 bg-[#161616] border-[#262626] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-[#C8A96B] bg-[#C8A96B]/15 px-2 py-0.5 rounded border border-[#C8A96B]/30">
                {a.targetAudience.replace('_', ' ')}
              </span>
              <span className="text-[10px] text-[#7E7E78]">{formatDate(a.createdAt)}</span>
            </div>
            <h3 className="text-base font-bold text-[#F5F5F0]">{a.title}</h3>
            <p className="text-xs text-[#8E8E88] leading-relaxed">{a.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
