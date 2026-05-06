'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { MovieListItem } from '@/lib/types';
import { MovieCard } from './MovieCard';

/**
 * A horizontal scroller row that renders a fixed list of movies. Unlike
 * MovieRow it has no period dropdown and never re-fetches — used for
 * recommendations and other server-curated lists.
 */
export function StaticMovieRow({
  title,
  movies,
}: {
  title: string;
  movies: MovieListItem[];
}) {
  const headingId = useId();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    updateEdges();
  }, [movies, updateEdges]);

  const scrollByDir = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85 * (direction === 'left' ? -1 : 1);
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

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

  if (movies.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="py-4">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <h2 id={headingId} className="text-lg font-semibold sm:text-xl">
          {title}
        </h2>
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
      <div className="relative">
        <div
          ref={scrollRef}
          tabIndex={0}
          aria-label={`${title} 영화 목록 (좌우 방향키로 스크롤)`}
          onScroll={updateEdges}
          onKeyDown={onKeyDown}
          className="scroll-row mt-3 flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-6 lg:px-8"
        >
          {movies.slice(0, 20).map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
        {!atEnd && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-bg to-transparent"
          />
        )}
      </div>
    </section>
  );
}
