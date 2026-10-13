'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6 text-center text-[#F5F5F0]">
      <div className="card-luxury p-8 sm:p-12 max-w-lg w-full space-y-6 bg-[#161616] border-[#2A2A2A]">
        <div className="w-16 h-16 rounded-full bg-rose-950/40 border border-rose-800/50 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-mono tracking-widest text-[#C8A96B]">
            FITLIFE System Alert
          </span>
          <h1 className="text-2xl font-black text-[#F5F5F0]">
            Service Temporarily Unavailable
          </h1>
          <p className="text-xs text-[#8E8E88] leading-relaxed">
            We encountered a temporary interruption while connecting to club services. Please retry or return to the main reception.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold uppercase text-xs tracking-wider transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded bg-[#222] hover:bg-[#333] border border-[#3A3A3A] text-[#F5F5F0] font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            <Home className="w-4 h-4 text-[#C8A96B]" />
            <span>Club Reception</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
