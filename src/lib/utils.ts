import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | { toNumber?: () => number } | null | undefined): string {
  if (amount === null || amount === undefined) return '₹0';
  const num =
    typeof amount === 'object' && amount !== null && typeof amount.toNumber === 'function'
      ? amount.toNumber()
      : typeof amount === 'string'
      ? parseFloat(amount)
      : Number(amount);
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function calculateRemainingDays(endDate: Date | string | null | undefined): number {
  if (!endDate) return 0;
  const target = new Date(endDate);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'COMPLETED':
    case 'CONFIRMED':
    case 'SENT':
      return {
        bg: 'bg-emerald-950/40',
        text: 'text-emerald-400',
        border: 'border-emerald-800/40',
      };
    case 'EXPIRING_SOON':
    case 'PENDING':
    case 'RETRYING':
      return {
        bg: 'bg-amber-950/40',
        text: 'text-amber-400',
        border: 'border-amber-800/40',
      };
    case 'EXPIRED':
    case 'FAILED':
    case 'CANCELLED':
      return {
        bg: 'bg-rose-950/40',
        text: 'text-rose-400',
        border: 'border-rose-800/40',
      };
    default:
      return {
        bg: 'bg-zinc-800/60',
        text: 'text-zinc-300',
        border: 'border-zinc-700/50',
      };
  }
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `FL-${year}-${random}`;
}

export function generateMembershipNumber(sequence = 1): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, '0');
  return `FL-${year}-${padded}`;
}
