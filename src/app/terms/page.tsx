import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function TermsPage() {
  const session = await getSession();
  const settings = await prisma.gymSettings.findUnique({ where: { id: 'default-settings' } });

  return (
    <div className="flex flex-col min-h-screen bg-[#111111]">
      <Navbar session={session} />

      <main className="flex-1 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="card-luxury p-8 sm:p-12 space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
              Legal Documentation
            </span>
            <h1 className="text-3xl font-extrabold text-[#F5F5F0]">Terms of Membership & Facility Conduct</h1>
            <p className="text-xs text-[#7E7E78]">Last Updated: October 2026</p>

            <div className="space-y-4 text-xs text-[#A0A09B] leading-relaxed border-t border-[#242424] pt-6">
              <h2 className="text-sm font-bold text-[#F5F5F0]">1. Membership Validity & Early Renewals</h2>
              <p>
                Memberships commence on the agreed start date and conclude on the recorded expiration date. Renewing early preserves all unexpired days by appending the new plan duration to your existing expiry date.
              </p>

              <h2 className="text-sm font-bold text-[#F5F5F0]">2. Personal Training Cancellation Policy</h2>
              <p>
                Appointments with personal trainers must be rescheduled or cancelled at least 6 hours in advance. No-shows will result in forfeiture of the session from the member&apos;s allocation.
              </p>

              <h2 className="text-sm font-bold text-[#F5F5F0]">3. Informational Diet & Nutrition Guidance</h2>
              <p>
                Diet charts provided through the FITLIFE portal are intended strictly for educational and fitness conditioning guidance. Clinical medical nutrition or therapy requires consultation with a licensed clinical dietitian or medical physician.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer gymInfo={settings} />
    </div>
  );
}
