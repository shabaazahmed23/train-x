'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  Calendar,
  QrCode,
  Tag,
  ClipboardList,
  Utensils,
  Megaphone,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Layers,
} from 'lucide-react';
import { logoutAction } from '@/lib/actions';

interface AdminSidebarProps {
  user: {
    email: string;
    name: string;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Members', href: '/admin/members', icon: Users },
    { label: 'Membership Plans', href: '/admin/plans', icon: Layers },
    { label: 'Trainers', href: '/admin/trainers', icon: Dumbbell },
    { label: 'Trainer Bookings', href: '/admin/bookings', icon: Calendar },
    { label: 'QR Attendance', href: '/admin/attendance', icon: QrCode },
    { label: 'Payments & Revenue', href: '/admin/payments', icon: CreditCard },
    { label: 'Offers & Coupons', href: '/admin/offers', icon: Tag },
    { label: 'Workout Templates', href: '/admin/workouts', icon: ClipboardList },
    { label: 'Diet Guidance', href: '/admin/diets', icon: Utensils },
    { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { label: 'Email Reminders & Logs', href: '/admin/emails', icon: Mail },
    { label: 'Gym Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = '/login';
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between bg-[#131313] border-r border-[#222222] text-[#A0A09B]">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#222222]">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded bg-[#1C1C1C] border border-[#C8A96B]/50 flex items-center justify-center font-bold text-[#C8A96B] text-lg">
              F
            </div>
            <div>
              <span className="text-base font-extrabold tracking-wider text-[#F5F5F0] block">
                FIT<span className="text-[#C8A96B]">LIFE</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C8A96B] flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" /> Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#C8A96B]/15 text-[#C8A96B] font-semibold border-r-2 border-[#C8A96B]'
                    : 'text-[#9E9E98] hover:text-[#F5F5F0] hover:bg-[#1A1A1A]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#C8A96B]' : 'text-[#7A7A75]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile & Logout */}
      <div className="p-4 border-t border-[#222222] space-y-3">
        <div className="px-2">
          <span className="text-xs font-semibold text-[#F5F5F0] block truncate">{user.name}</span>
          <span className="text-[10px] text-[#7A7A75] block truncate">{user.email}</span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-rose-400 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#141414] border-b border-[#222222] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-[#1C1C1C] border border-[#C8A96B]/50 flex items-center justify-center font-bold text-[#C8A96B] text-xs">
            F
          </div>
          <span className="text-sm font-bold text-[#F5F5F0]">FITLIFE Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-[#A0A09B] hover:text-[#F5F5F0]"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 flex">
          <div className="w-72 max-w-full h-full bg-[#131313]">{navContent}</div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 overflow-y-auto">
        {navContent}
      </aside>
    </>
  );
}
