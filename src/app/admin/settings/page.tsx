import { prisma } from '@/lib/prisma';
import { adminUpdateGymSettingsAction } from '@/lib/actions';
import { Settings, Save, Shield, Globe, Clock, Bell } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await prisma.gymSettings.findUnique({
    where: { id: 'default-settings' },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[#222] pb-6">
        <span className="text-[11px] uppercase font-mono tracking-widest text-[#C8A96B]">
          Configuration & Localization
        </span>
        <h1 className="text-2xl font-black text-[#F5F5F0]">Club Settings & Branding</h1>
        <p className="text-xs text-[#8E8E88]">
          Configure gym branding, coordinates, reminder intervals, and operation parameters.
        </p>
      </div>

      <form
        action={async (fd) => {
          'use server';
          await adminUpdateGymSettingsAction(fd);
        }}
        className="card-luxury p-8 bg-[#161616] border-[#262626] space-y-6"
      >
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#C8A96B] flex items-center gap-2">
            <Globe className="h-4 w-4" /> Gym Identity & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#A0A09B] mb-1.5 font-medium">Gym / Brand Name</label>
              <input
                name="gymName"
                required
                defaultValue={settings?.gymName || 'FITLIFE Luxury Fitness Club'}
                className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
              />
            </div>
            <div>
              <label className="block text-[#A0A09B] mb-1.5 font-medium">Concierge Contact Email</label>
              <input
                name="contactEmail"
                type="email"
                required
                defaultValue={settings?.contactEmail || 'concierge@fitlife.club'}
                className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#A0A09B] mb-1.5 font-medium">Concierge Phone Number</label>
              <input
                name="contactPhone"
                required
                defaultValue={settings?.contactPhone || '+91 80 4990 8800'}
                className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
              />
            </div>
            <div>
              <label className="block text-[#A0A09B] mb-1.5 font-medium">Club Timezone</label>
              <input
                name="timezone"
                required
                defaultValue={settings?.timezone || 'Asia/Kolkata'}
                className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-[#A0A09B] mb-1.5 font-medium">Facility Physical Address</label>
            <input
              name="address"
              required
              defaultValue={settings?.address || 'Level 4, Signature Towers, Financial District, Bangalore, KA 560103'}
              className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
            />
          </div>

          <div className="text-xs">
            <label className="block text-[#A0A09B] mb-1.5 font-medium">Operating Hours Schedule</label>
            <input
              name="openingHours"
              required
              defaultValue={settings?.openingHours || 'Mon - Sat: 5:30 AM - 11:00 PM | Sun: 7:00 AM - 8:00 PM'}
              className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
            />
          </div>
        </div>

        <div className="border-t border-[#242424] pt-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#C8A96B] flex items-center gap-2">
            <Bell className="h-4 w-4" /> Automated Email Reminder Schedules
          </h2>

          <div className="text-xs">
            <label className="block text-[#A0A09B] mb-1.5 font-medium">
              Reminder Lead Days (JSON Array)
            </label>
            <input
              name="reminderLeadDays"
              required
              defaultValue={settings?.reminderLeadDays || '[7,3,1,0]'}
              className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0] font-mono focus:outline-none focus:border-[#C8A96B]"
            />
            <p className="text-[11px] text-[#7E7E78] mt-1">
              Standard: <code>[7, 3, 1, 0]</code> sends warnings at 7 days, 3 days, 1 day, and on expiry date.
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer text-xs">
              <input
                type="checkbox"
                name="allowOnlinePayments"
                value="true"
                defaultChecked={settings?.allowOnlinePayments ?? true}
                className="text-[#C8A96B] rounded bg-[#111] border-[#333]"
              />
              <span className="text-[#F5F5F0] font-medium">Enable Online Digital Payments & UPI Gateways</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-[#242424]">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold uppercase text-xs tracking-wider transition-colors"
          >
            <Save className="h-4 w-4" /> Save Club Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
