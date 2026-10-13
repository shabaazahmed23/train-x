'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/actions';
import { Shield, User, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      } else {
        setError(result.error || 'Authentication failed. Please check credentials.');
      }
    });
  };

  const handleQuickAdminLogin = () => {
    setError(null);
    const formData = new FormData();
    formData.append('email', 'admin@fitlife.com');
    formData.append('password', 'Admin@Fitlife2026!');
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      } else {
        setError(result.error || 'Administrator authentication failed.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" prefetch={true} className="inline-flex items-center gap-2 group mb-4">
          <div className="h-10 w-10 rounded bg-[#1A1A1A] border border-[#C8A96B]/50 flex items-center justify-center font-bold text-[#C8A96B] text-xl">
            F
          </div>
          <span className="text-2xl font-black tracking-widest text-[#F5F5F0]">
            FIT<span className="text-[#C8A96B]">LIFE</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-[#F5F5F0]">Account Authentication</h2>
        <p className="mt-1 text-xs text-[#A0A09B]">
          Enter your credentials to access your administrative or member dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-luxury p-6 sm:p-8 border-[#262626] bg-[#141414] shadow-2xl">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="name@fitlife.com"
                  className="w-full rounded bg-[#101010] border border-[#282828] pl-9 pr-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#C8A96B] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[#7E7E78]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded bg-[#101010] border border-[#282828] pl-9 pr-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] active:scale-[0.99] text-[#111] font-bold text-xs uppercase tracking-wider py-3 px-4 transition-all disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isPending ? 'Authenticating...' : 'Sign In'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick 1-Click Admin Direct Sign In */}
          <div className="mt-6 pt-5 border-t border-[#222222]">
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded border border-[#2D2D2D] hover:border-[#C8A96B] bg-[#181818] text-[#C8A96B] hover:text-[#DFCA98] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span>{isPending ? 'Authenticating...' : '1-Click Administrator Access'}</span>
            </button>
          </div>

          <div className="mt-5 text-center text-xs text-[#80807B]">
            Don&apos;t have a member account?{' '}
            <Link href="/register" className="text-[#C8A96B] font-semibold hover:underline">
              Enroll now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
