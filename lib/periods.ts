import type { Period } from './types';

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: '1m', label: '1개월' },
  { value: '3m', label: '3개월' },
  { value: '6m', label: '6개월' },
  { value: '12m', label: '1년' },
];

export const PERIOD_MONTHS: Record<Period, number> = {
  '1m': 1,
  '3m': 3,
  '6m': 6,
  '12m': 12,
};

export function isPeriod(value: unknown): value is Period {
  return value === '1m' || value === '3m' || value === '6m' || value === '12m';
}

/**
 * Returns ISO date strings (YYYY-MM-DD) for a TMDB primary_release_date range
 * spanning the last N months up to today.
 */
export function periodToDateRange(period: Period): { gte: string; lte: string } {
  const now = new Date();
  const lte = toIsoDate(now);
  const start = new Date(now);
  start.setMonth(start.getMonth() - PERIOD_MONTHS[period]);
  return { gte: toIsoDate(start), lte };
}

function toIsoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
