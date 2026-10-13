import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { ContactForm } from '@/components/public/ContactForm';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const session = await getSession();
  const settings = await prisma.gymSettings.findUnique({ where: { id: 'default-settings' } });

  return (
    <div className="flex flex-col min-h-screen bg-[#111111]">
      <Navbar session={session} />

      <main className="flex-1">
        <section className="py-20 bg-[#141414] border-b border-[#222222]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C8A96B]">
              Member Concierge
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#F5F5F0] mt-2 mb-4">
              Connect With FITLIFE
            </h1>
            <p className="text-base text-[#A0A09B] leading-relaxed">
              Whether you are scheduling a private club tour, inquiring about VIP memberships, or connecting with our coaching faculty, our team is at your disposal.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 space-y-6">
                <div className="card-luxury p-6 space-y-4">
                  <h3 className="text-lg font-bold text-[#F5F5F0]">Club Coordinates</h3>
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-[#C8A96B] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#F5F5F0] block">Address</strong>
                        <span className="text-[#8E8E88]">{settings?.address || 'Level 4, Signature Towers, Financial District, Bangalore'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-[#C8A96B] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#F5F5F0] block">Direct Concierge</strong>
                        <span className="text-[#8E8E88]">{settings?.contactPhone || '+91 80 4990 8800'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-[#C8A96B] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#F5F5F0] block">Inquiries Email</strong>
                        <span className="text-[#8E8E88]">{settings?.contactEmail || 'concierge@fitlife.club'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-[#C8A96B] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#F5F5F0] block">Facility Hours</strong>
                        <span className="text-[#8E8E88]">{settings?.openingHours || 'Mon - Sat: 5:30 AM - 11:00 PM | Sun: 7:00 AM - 8:00 PM'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-luxury p-6 bg-[#161616] border-[#2E2E2E]">
                  <h4 className="text-xs uppercase font-bold tracking-widest text-[#C8A96B] mb-2">
                    Parking & Arrival
                  </h4>
                  <p className="text-xs text-[#8E8E88] leading-relaxed">
                    Complimentary valet parking is available at the main entrance tower. Accessible elevator access directly connects the underground valet bay to Level 4 reception.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer gymInfo={settings} />
    </div>
  );
}
