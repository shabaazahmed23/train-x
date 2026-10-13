'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Shield, User, ArrowRight, LogOut } from 'lucide-react';
import { logoutAction } from '@/lib/actions';

interface NavbarProps {
  session?: {
    email: string;
    role: string;
    name: string;
  } | null;
}

export function Navbar({ session }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Membership', href: '/membership' },
    { label: 'Trainers', href: '/trainers' },
    { label: 'Offers', href: '/offers' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logoutAction();
      router.push('/login');
      router.refresh();
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#222222] bg-[#111111]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Brand Logo */}
        <Link href="/" prefetch={true} className="flex items-center gap-2 group">
          <div className="h-10 w-10 rounded bg-[#1A1A1A] border border-[#C8A96B]/40 flex items-center justify-center font-bold text-[#C8A96B] text-xl tracking-wider group-hover:border-[#C8A96B] transition-colors">
            F
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-widest text-[#F5F5F0]">
              FIT<span className="text-[#C8A96B]">LIFE</span>
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#A0A09B]">
              Luxury Athletics
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links with Active Route Highlighting */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`text-sm transition-all py-1.5 relative ${
                  isActive
                    ? 'font-bold text-[#C8A96B]'
                    : 'font-medium text-[#A0A09B] hover:text-[#F5F5F0]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8A96B] rounded-full animate-in fade-in" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-2.5">
              <Link
                href={session.role === 'ADMIN' ? '/admin' : '/member'}
                prefetch={true}
                className="flex items-center gap-2 rounded border border-[#C8A96B] px-4 py-2 text-xs font-semibold text-[#C8A96B] hover:bg-[#C8A96B]/15 transition-colors"
              >
                {session.role === 'ADMIN' ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                {session.role === 'ADMIN' ? 'Admin Portal' : 'Member Portal'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label="Sign Out"
                className="flex items-center gap-1.5 rounded border border-[#2D2D2D] hover:border-rose-700/60 px-3 py-2 text-xs text-[#A0A09B] hover:text-rose-400 hover:bg-rose-950/20 transition-colors disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                prefetch={true}
                className={`text-sm font-medium transition-colors px-3 py-2 ${
                  pathname === '/login' ? 'text-[#C8A96B] font-semibold' : 'text-[#A0A09B] hover:text-[#F5F5F0]'
                }`}
              >
                Log In
              </Link>
              <Link
                href="/register"
                prefetch={true}
                className="flex items-center gap-1.5 rounded bg-[#C8A96B] hover:bg-[#DFCA98] active:scale-95 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#111111] transition-all shadow-md shadow-[#C8A96B]/10"
              >
                Join Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#A0A09B] hover:text-[#F5F5F0] transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-[#222222] bg-[#141414] px-4 pt-2 pb-6 space-y-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onClick={() => setMobileOpen(false)}
                className={`block py-2 text-base transition-colors ${
                  isActive
                    ? 'font-bold text-[#C8A96B]'
                    : 'font-medium text-[#A0A09B] hover:text-[#F5F5F0]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-[#262626] flex flex-col gap-3">
            {session ? (
              <>
                <Link
                  href={session.role === 'ADMIN' ? '/admin' : '/member'}
                  prefetch={true}
                  onClick={() => setMobileOpen(false)}
                  className="flex justify-center items-center gap-2 rounded border border-[#C8A96B] py-2.5 text-sm font-semibold text-[#C8A96B]"
                >
                  {session.role === 'ADMIN' ? 'Admin Portal' : 'Member Portal'}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="flex justify-center items-center gap-2 rounded border border-[#2D2D2D] py-2.5 text-xs text-rose-400 hover:bg-rose-950/20"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  prefetch={true}
                  onClick={() => setMobileOpen(false)}
                  className="block text-center py-2 text-sm text-[#A0A09B] hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  prefetch={true}
                  onClick={() => setMobileOpen(false)}
                  className="block text-center rounded bg-[#C8A96B] py-2.5 text-sm font-semibold uppercase tracking-wider text-black"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
