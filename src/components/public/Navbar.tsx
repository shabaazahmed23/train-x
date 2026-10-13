'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Shield, User, ArrowRight } from 'lucide-react';

interface NavbarProps {
  session?: {
    email: string;
    role: string;
    name: string;
  } | null;
}

export function Navbar({ session }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Membership', href: '/membership' },
    { label: 'Trainers', href: '/trainers' },
    { label: 'Offers', href: '/offers' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#222222] bg-[#111111]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
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

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#A0A09B] hover:text-[#F5F5F0] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <Link
              href={session.role === 'ADMIN' ? '/admin' : '/member'}
              className="flex items-center gap-2 rounded border border-[#C8A96B]/50 px-4 py-2 text-xs font-semibold text-[#C8A96B] hover:bg-[#C8A96B]/10 transition-colors"
            >
              {session.role === 'ADMIN' ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              {session.role === 'ADMIN' ? 'Admin Portal' : 'Member Portal'}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-[#A0A09B] hover:text-[#F5F5F0] transition-colors px-3 py-2"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded bg-[#C8A96B] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#111111] hover:bg-[#DFCA98] transition-colors"
              >
                Join Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#A0A09B] hover:text-[#F5F5F0]"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-[#222222] bg-[#141414] px-4 pt-2 pb-6 space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-base font-medium text-[#A0A09B] hover:text-[#C8A96B]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#262626] flex flex-col gap-3">
            {session ? (
              <Link
                href={session.role === 'ADMIN' ? '/admin' : '/member'}
                onClick={() => setMobileOpen(false)}
                className="flex justify-center items-center gap-2 rounded border border-[#C8A96B] py-2.5 text-sm font-medium text-[#C8A96B]"
              >
                {session.role === 'ADMIN' ? 'Admin Portal' : 'Member Portal'}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center py-2 text-sm text-[#A0A09B] hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
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
