import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MemberSidebar } from '@/components/member/MemberSidebar';

export const dynamic = 'force-dynamic';

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  let profile: Awaited<ReturnType<typeof prisma.memberProfile.findUnique>> = null;
  try {
    profile = await prisma.memberProfile.findUnique({
      where: { userId: session.id },
    });
  } catch (error) {
    console.error('Database query error in MemberLayout:', error);
  }

  return (
    <div className="flex min-h-screen bg-[#111111] text-[#F5F5F0]">
      <MemberSidebar
        user={session}
        membershipNumber={profile?.membershipNumber || undefined}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
