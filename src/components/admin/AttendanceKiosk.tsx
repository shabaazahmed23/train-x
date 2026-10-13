'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { processAttendanceCheckInAction } from '@/lib/actions';
import { QrCode, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

export function AttendanceKiosk() {
  const router = useRouter();
  const [memberIdInput, setMemberIdInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const handleScan = (idToProcess?: string) => {
    const target = idToProcess || memberIdInput;
    if (!target.trim()) return;

    setResult(null);
    startTransition(async () => {
      const res = await processAttendanceCheckInAction(target.trim());
      setResult(res);
      if (res.success) {
        setMemberIdInput('');
        router.refresh();
      }
    });
  };

  return (
    <div className="card-luxury p-6 bg-[#161616] border-[#262626] space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded bg-[#C8A96B]/15 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B]">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#F5F5F0]">Turnstile Scanner Simulator</h3>
          <p className="text-[11px] text-[#7E7E78]">Simulate RFID badge or turnstile camera scan</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
            Membership ID / Pass
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={memberIdInput}
              onChange={(e) => setMemberIdInput(e.target.value)}
              placeholder="e.g. FL-2026-0001"
              className="flex-1 rounded bg-[#101010] border border-[#282828] px-3.5 py-2.5 text-xs text-[#F5F5F0] uppercase font-mono focus:outline-none focus:border-[#C8A96B]"
            />
            <button
              type="button"
              onClick={() => handleScan()}
              disabled={isPending || !memberIdInput.trim()}
              className="px-4 py-2.5 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black text-xs font-bold uppercase disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Verifying...' : 'Validate'}
            </button>
          </div>
        </div>

        {/* Quick Demo Simulator Buttons */}
        <div className="pt-2 border-t border-[#222]">
          <span className="text-[10px] font-mono uppercase text-[#7E7E78] block mb-2">
            One-Click Scan Test:
          </span>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleScan('FL-2026-0001')}
              className="w-full flex items-center justify-between p-2 rounded bg-[#1A1A1A] hover:border-[#C8A96B] border border-[#262626] text-[11px] text-left transition-colors"
            >
              <span className="text-[#F5F5F0]">Rahul Verma (Active Gold)</span>
              <span className="font-mono text-[#C8A96B]">FL-2026-0001</span>
            </button>

            <button
              type="button"
              onClick={() => handleScan('FL-2026-0002')}
              className="w-full flex items-center justify-between p-2 rounded bg-[#1A1A1A] hover:border-amber-500 border border-[#262626] text-[11px] text-left transition-colors"
            >
              <span className="text-amber-400">Sneha Patel (Expiring in 4d)</span>
              <span className="font-mono text-amber-400">FL-2026-0002</span>
            </button>

            <button
              type="button"
              onClick={() => handleScan('FL-2026-0003')}
              className="w-full flex items-center justify-between p-2 rounded bg-[#1A1A1A] hover:border-rose-500 border border-[#262626] text-[11px] text-left transition-colors"
            >
              <span className="text-rose-400">Arjun Mehta (Expired Plan)</span>
              <span className="font-mono text-rose-400">FL-2026-0003</span>
            </button>
          </div>
        </div>

        {/* Verification Outcome Box */}
        {result && (
          <div
            className={`p-4 rounded border text-xs space-y-1.5 ${
              result.success
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {result.success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>ACCESS GRANTED — TURNSTILE UNLOCKED</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>ACCESS REJECTED</span>
                </>
              )}
            </div>

            {result.success ? (
              <div className="text-[11px] space-y-0.5 text-emerald-200">
                <p>Member: <strong>{result.memberName}</strong> ({result.membershipNumber})</p>
                <p>Check-In Logged: {result.checkInTime}</p>
                <p>Days Remaining: {result.daysRemaining} days</p>
              </div>
            ) : (
              <p className="text-[11px] text-rose-200">{result.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
