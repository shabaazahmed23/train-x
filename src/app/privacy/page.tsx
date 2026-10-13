import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
  const session = await getSession();
  let settings: Awaited<ReturnType<typeof prisma.gymSettings.findUnique>> = null;
  try {
    settings = await prisma.gymSettings.findUnique({ where: { id: 'default-settings' } });
  } catch (error) {
    console.error('Database query error in PrivacyPage:', error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#111111]">
      <Navbar session={session} />

      <main className="flex-1 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="card-luxury p-8 sm:p-12 space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
              Legal Documentation
            </span>
            <h1 className="text-3xl font-extrabold text-[#F5F5F0]">Privacy & Biometric Data Policy</h1>
            <p className="text-xs text-[#7E7E78]">Last Updated: October 2026</p>

            <div className="space-y-4 text-xs text-[#A0A09B] leading-relaxed border-t border-[#242424] pt-6">
              <h2 className="text-sm font-bold text-[#F5F5F0]">1. Data Collection & Membership ID</h2>
              <p>
                FITLIFE collects legal name, email address, emergency contact numbers, and optional biometric measurements (body weight, body fat) to maintain member access, personalized workout assignments, and safety protocols within the club.
              </p>

              <h2 className="text-sm font-bold text-[#F5F5F0]">2. Automated Reminder Communications</h2>
              <p>
                Transactional emails regarding membership expiration, payment invoices, and trainer appointment confirmations are dispatched automatically based on your membership cycle. We do not sell your personal data to third parties.
              </p>

              <h2 className="text-sm font-bold text-[#F5F5F0]">3. Facility Turnstile Access</h2>
              <p>
                Turnstile QR check-in logs timestamp and membership status to prevent unauthorized access and verify facility capacity in compliance with municipal health and safety codes.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer gymInfo={settings} />
    </div>
  );
}
