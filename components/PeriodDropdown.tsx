'use client';

import { PERIOD_OPTIONS, isPeriod } from '@/lib/periods';
import type { Period } from '@/lib/types';

type Props = {
  id: string;
  label: string;
  value: Period;
  onChange: (next: Period) => void;
  disabled?: boolean;
};

/**
 * Native <select> for maximum accessibility (keyboard, screen reader,
 * mobile picker support all "for free").
 */
export function PeriodDropdown({ id, label, value, onChange, disabled }: Props) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-xs text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const v = e.target.value;
          if (isPeriod(v)) onChange(v);
        }}
        className="cursor-pointer rounded border border-white/10 bg-surface px-2 py-1 text-sm text-white hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {PERIOD_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            최근 {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
