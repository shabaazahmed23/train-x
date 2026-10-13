'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
        <h2 className="text-2xl font-bold text-[#F5F5F0]">Reset Your Credentials</h2>
        <p className="mt-1 text-xs text-[#A0A09B]">
          Enter your registered email address to receive secure password recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-luxury p-6 sm:p-8 border-[#262626] bg-[#141414] shadow-2xl">
          {submitted ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
              <h3 className="text-base font-bold text-[#F5F5F0]">Recovery Link Dispatched</h3>
              <p className="text-xs text-[#8E8E88] leading-relaxed">
                If an account exists for <strong className="text-[#F5F5F0]">{email}</strong>, a secure password reset link has been dispatched to your inbox.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#C8A96B] font-semibold hover:underline"
                >
                  Return to Login &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#7E7E78]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded bg-[#101010] border border-[#282828] pl-9 pr-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-[#111] font-bold text-xs uppercase tracking-wider py-3 px-4 transition-all mt-2"
              >
                Send Password Reset Instructions <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-[#A0A09B] hover:text-[#F5F5F0]">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
