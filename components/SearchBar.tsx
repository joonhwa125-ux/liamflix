'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');

  useEffect(() => {
    setValue(params.get('q') ?? '');
  }, [params]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form role="search" onSubmit={onSubmit} className="relative w-full">
      <label htmlFor="site-search" className="sr-only">
        영화 검색
      </label>
      <input
        id="site-search"
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="영화 제목 검색"
        autoComplete="off"
        className="w-full rounded-full border border-white/10 bg-surface px-4 py-2 pl-10 text-sm placeholder:text-muted focus:border-white/30"
      />
      <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
        {/* Search icon (SVG, no extra deps) */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-3.5-3.5" />
        </svg>
      </span>
      <button type="submit" className="sr-only">
        검색
      </button>
    </form>
  );
}
