'use client';

import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  receipt: {
    receiptNumber: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    createdAt: string;
    planName?: string;
    memberName: string;
    membershipNumber: string;
  };
}

export function ReceiptModal({ receipt }: ReceiptModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-2.5 py-1 rounded bg-[#222] hover:bg-[#333] border border-[#3A3A3A] text-[11px] text-[#C8A96B] font-mono"
      >
        View Receipt
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="w-full max-w-lg rounded-xl bg-[#161616] border border-[#2D2D2D] p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#F5F5F0] print:bg-white print:text-black print:border-none">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#7E7E78] hover:text-white print:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Receipt Header */}
            <div className="flex items-center justify-between border-b border-[#282828] pb-4 print:border-gray-200">
              <div>
                <span className="text-xl font-extrabold tracking-widest text-[#F5F5F0] print:text-black">
                  FIT<span className="text-[#C8A96B]">LIFE</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#A0A09B] block print:text-gray-600">
                  Luxury Athletic Club Receipt
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[#C8A96B] block">
                  {receipt.receiptNumber}
                </span>
                <span className="text-[10px] text-[#7E7E78] print:text-gray-500">
                  {formatDate(receipt.createdAt)}
                </span>
              </div>
            </div>

            {/* Member & Club Info */}
            <div className="grid grid-cols-2 gap-4 text-xs border-b border-[#282828] pb-4 print:border-gray-200">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#7E7E78] print:text-gray-500 block">
                  Issued To:
                </span>
                <strong className="text-sm block">{receipt.memberName}</strong>
                <span className="font-mono text-[#C8A96B] text-[11px] block">{receipt.membershipNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-[#7E7E78] print:text-gray-500 block">
                  Club Location:
                </span>
                <span>Signature Towers, Level 4</span>
                <span className="text-[#7E7E78] print:text-gray-500 block text-[11px]">Bangalore Financial District</span>
              </div>
            </div>

            {/* Itemized breakdown */}
            <div className="space-y-3 text-xs border-b border-[#282828] pb-4 print:border-gray-200">
              <div className="flex justify-between font-bold text-[#8E8E88] print:text-gray-700">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>{receipt.planName || 'Gym Membership Access'}</span>
                <span>{formatCurrency(receipt.amount)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-xs text-[#7E7E78] print:text-gray-500 block">Payment Method</span>
                <span className="font-mono uppercase text-xs text-[#C8A96B]">{receipt.method}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#7E7E78] print:text-gray-500 block">
                  Total Paid (INR)
                </span>
                <strong className="text-2xl font-black text-[#C8A96B] print:text-black">
                  {formatCurrency(receipt.amount)}
                </strong>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-[#7E7E78] text-center border-t border-[#222] print:border-gray-200">
              Thank you for training with FITLIFE. Electronic computerized invoice.
            </div>

            <div className="flex justify-end gap-3 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold text-xs uppercase"
              >
                <Printer className="h-3.5 w-3.5" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
