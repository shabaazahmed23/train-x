'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    setSuccess(true);
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
        <h2 className="text-2xl font-bold text-[#F5F5F0]">Set New Password</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-luxury p-6 sm:p-8 border-[#262626] bg-[#141414] shadow-2xl">
          {success ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
              <h3 className="text-base font-bold text-[#F5F5F0]">Password Updated Successfully</h3>
              <p className="text-xs text-[#8E8E88]">
                Your new security password is saved. You can now log into your account.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded bg-[#C8A96B] px-5 py-2.5 text-black text-xs font-bold uppercase tracking-wider"
                >
                  Sign In Now &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="p-3 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#7E7E78]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full rounded bg-[#101010] border border-[#282828] pl-9 pr-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
                  Confirm New Password
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

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-[#111] font-bold text-xs uppercase tracking-wider py-3 px-4 transition-all mt-2"
              >
                Update Password <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
