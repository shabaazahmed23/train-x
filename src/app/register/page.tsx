'use client';

import { Suspense, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerAction } from '@/lib/actions';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get('plan');
  const preselectedCoupon = searchParams.get('coupon');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);

    startTransition(async () => {
      const result = await registerAction(formData);
      if (result.success && result.redirectTo) {
        if (preselectedPlan) {
          router.push(
            `/member/renew?plan=${preselectedPlan}${
              preselectedCoupon ? `&coupon=${preselectedCoupon}` : ''
            }`
          );
        } else {
          router.push(result.redirectTo);
        }
        router.refresh();
      } else {
        setError(result.error || 'Registration failed. Please check inputs.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="h-10 w-10 rounded bg-[#1A1A1A] border border-[#C8A96B]/50 flex items-center justify-center font-bold text-[#C8A96B] text-xl">
            F
          </div>
          <span className="text-2xl font-black tracking-widest text-[#F5F5F0]">
            FIT<span className="text-[#C8A96B]">LIFE</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-[#F5F5F0]">Digital Membership Enrollment</h2>
        <p className="mt-1 text-xs text-[#A0A09B]">
          Establish your FITLIFE credentials to access workouts, recovery suites, and private training.
        </p>

        {preselectedPlan && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#C8A96B]/15 border border-[#C8A96B]/40 text-[#C8A96B] text-xs font-semibold">
            <span>Selected Tier: {preselectedPlan.toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-luxury p-6 sm:p-8 border-[#262626] bg-[#141414] shadow-2xl">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-[#7E7E78]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anirudh Sharma"
                  className="w-full rounded bg-[#101010] border border-[#282828] pl-9 pr-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#7E7E78]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anirudh@example.com"
                  className="w-full rounded bg-[#101010] border border-[#282828] pl-9 pr-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-[#7E7E78]" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded bg-[#101010] border border-[#282828] pl-9 pr-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#7E7E78]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    className="w-full rounded bg-[#101010] border border-[#282828] pl-9 pr-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#7E7E78]" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded bg-[#101010] border border-[#282828] pl-9 pr-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-[#111] font-bold text-xs uppercase tracking-wider py-3 px-4 transition-all disabled:opacity-50 mt-4"
            >
              {isPending ? 'Enrolling Account...' : 'Complete Registration'}{' '}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-[#80807B]">
            Already a FITLIFE member?{' '}
            <Link href="/login" className="text-[#C8A96B] font-semibold hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center text-xs text-[#7E7E78]">
          Loading Enrollment Gateway...
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
