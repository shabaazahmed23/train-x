import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

interface FooterProps {
  gymInfo?: {
    gymName?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    openingHours?: string;
  } | null;
}

export function Footer({ gymInfo }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const name = gymInfo?.gymName || 'FITLIFE Luxury Fitness Club';
  const email = gymInfo?.contactEmail || 'concierge@fitlife.club';
  const phone = gymInfo?.contactPhone || '+91 80 4990 8800';
  const address = gymInfo?.address || 'Level 4, Signature Towers, Financial District, Bangalore';
  const hours = gymInfo?.openingHours || 'Mon - Sat: 5:30 AM - 11:00 PM | Sun: 7:00 AM - 8:00 PM';

  return (
    <footer className="border-t border-[#222222] bg-[#0E0E0E] text-[#A0A09B]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded bg-[#1A1A1A] border border-[#C8A96B]/50 flex items-center justify-center font-bold text-[#C8A96B] text-lg">
                F
              </div>
              <span className="text-xl font-extrabold tracking-widest text-[#F5F5F0]">
                FIT<span className="text-[#C8A96B]">LIFE</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#80807B]">
              FITLIFE is an elite fitness haven architected for discerning individuals demanding high-performance equipment, clinical-grade recovery, and bespoke coaching.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#C8A96B]">
              <ShieldCheck className="h-4 w-4" />
              <span>Certified Olympic Lifting & Recovery Facility</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F5F0] mb-4">
              Explore FITLIFE
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/membership" className="hover:text-[#F5F5F0] transition-colors">
                  Membership Packages
                </Link>
              </li>
              <li>
                <Link href="/trainers" className="hover:text-[#F5F5F0] transition-colors">
                  Master Trainers
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-[#F5F5F0] transition-colors">
                  Seasonal Privileges & Offers
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#F5F5F0] transition-colors">
                  Club Philosophy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F5F5F0] transition-colors">
                  Concierge & Tours
                </Link>
              </li>
            </ul>
          </div>

          {/* Member Portals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F5F0] mb-4">
              Access & Portals
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/login" className="hover:text-[#F5F5F0] transition-colors">
                  Member & Admin Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#F5F5F0] transition-colors">
                  Enroll Digital Account
                </Link>
              </li>
              <li>
                <Link href="/member/renew" className="hover:text-[#F5F5F0] transition-colors">
                  Instant Renewal
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#F5F5F0] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#F5F5F0] transition-colors">
                  Terms of Membership
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F5F0] mb-4">
              Club Concierge
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#C8A96B] shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#C8A96B] shrink-0" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#C8A96B] shrink-0" />
                <span>{email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-[#C8A96B] shrink-0 mt-0.5" />
                <span>{hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1F1F1F] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#70706B]">
          <p>&copy; {currentYear} {name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#F5F5F0]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#F5F5F0]">Terms</Link>
            <Link href="/contact" className="hover:text-[#F5F5F0]">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
