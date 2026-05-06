'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { MovieListItem, Period } from '@/lib/types';
import { MovieCard } from './MovieCard';
import { PeriodDropdown } from './PeriodDropdown';

type Props = {
  title: string;
  kind:
    | 'new_release'
    | 'korean'
    | 'foreign'
    | 'top_rated_recent'
    | 'genre'
    | 'now_playing'
    | 'upcoming'
    | 'popular';
  /** When provided, shows the period dropdown initialized to this value. */
  defaultPeriod?: Period;
  /** Required when kind === 'genre'. */
  genre?: string;
  /** Initial server-rendered movies to avoid flash. */
  initialMovies: MovieListItem[];
};

export function MovieRow({ title, kind, defaultPeriod, genre, initialMovies }: Props) {
  const [period, setPeriod] = useState<Period | undefined>(defaultPeriod);
  const [movies, setMovies] = useState<MovieListItem[]>(initialMovies);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasMountedRef = useRef(false);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const headingId = useId();
  const dropdownId = useId();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Skip first render — initialMovies are already rendered. Re-fetch when
  // period (or kind/genre) changes after mount.
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ kind });
        if (period) params.set('period', period);
        if (genre) params.set('genre', genre);
        const res = await fetch(`/api/movies?${params.toString()}`);
        if (!res.ok) throw new Error(`요청 실패 (${res.status})`);
        const data = (await res.json()) as { results: MovieListItem[] };
        if (!cancelled) setMovies(data.results ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [period, kind, genre]);

  const updateScrollEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    updateScrollEdges();
  }, [movies, updateScrollEdges]);

  const scrollByDir = useCallback(
    (direction: 'left' | 'right') => {
      const el = scrollRef.current;
      if (!el) return;
      const amount = el.clientWidth * 0.85 * (direction === 'left' ? -1 : 1);
      el.scrollBy({ left: amount, behavior: 'smooth' });
    },
    []
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      if (!el) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollByDir('right');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollByDir('left');
      } else if (e.key === 'Home') {
        e.preventDefault();
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      }
    },
    [scrollByDir]
  );

  return (
    <section aria-labelledby={headingId} className="py-4">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <h2 id={headingId} className="text-lg font-semibold sm:text-xl">
          {title}
        </h2>
        {defaultPeriod && (
          <PeriodDropdown
            id={dropdownId}
            label="기간"
            value={period ?? defaultPeriod}
            onChange={setPeriod}
            disabled={loading}
          />
        )}
        <div className="ml-auto hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollByDir('left')}
            disabled={atStart}
            aria-label={`${title} 이전으로 스크롤`}
            className="rounded-full border border-white/10 bg-surface p-2 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByDir('right')}
            disabled={atEnd}
            aria-label={`${title} 다음으로 스크롤`}
            className="rounded-full border border-white/10 bg-surface p-2 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Single live region: announces loading start/end and errors */}
      <span role="status" aria-live="polite" className="sr-only">
        {loading ? '불러오는 중' : error ? `오류: ${error}` : ''}
      </span>

      {error && (
        <p role="alert" className="mx-auto mt-2 max-w-screen-2xl px-4 text-sm text-red-400 sm:px-6 lg:px-8">
          {error}
        </p>
      )}

      <div className="relative">
        <div
          ref={scrollRef}
          tabIndex={0}
          aria-label={`${title} 영화 목록 (좌우 방향키로 스크롤)`}
          onScroll={updateScrollEdges}
          onKeyDown={onKeyDown}
          className="scroll-row mt-3 flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-6 lg:px-8"
        >
          {movies.length === 0 && !loading ? (
            <p className="text-sm text-muted">표시할 영화가 없습니다.</p>
          ) : (
            movies.slice(0, 20).map((m) => <MovieCard key={m.id} movie={m} />)
          )}
        </div>
        {/* Right-edge fade hint (decorative) */}
        {!atEnd && movies.length > 0 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-bg to-transparent"
          />
        )}
      </div>
    </section>
  );
}
