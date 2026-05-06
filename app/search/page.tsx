import { Suspense } from 'react';
import type { Metadata } from 'next';
import { searchMovies } from '@/lib/tmdb';
import { MovieGrid } from '@/components/MovieGrid';

type SearchParams = { searchParams: { q?: string } };

export function generateMetadata({ searchParams }: SearchParams): Metadata {
  const q = (searchParams.q ?? '').trim();
  return {
    title: q ? `'${q}' 검색 결과 | LiamFlix` : '검색 | LiamFlix',
    robots: { index: false, follow: false },
  };
}

export default function SearchPage({ searchParams }: SearchParams) {
  const q = (searchParams.q ?? '').trim();

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold sm:text-3xl">검색</h1>
      {q ? (
        <p className="mt-1 text-sm text-muted">
          &ldquo;<span className="text-white">{q}</span>&rdquo; 검색 결과
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">상단의 검색창에 영화 제목을 입력하세요.</p>
      )}

      {q && (
        <Suspense
          key={q}
          fallback={
            <p role="status" className="mt-8 text-sm text-muted">
              검색 중…
            </p>
          }
        >
          <SearchResults q={q} />
        </Suspense>
      )}
    </div>
  );
}

async function SearchResults({ q }: { q: string }) {
  let count = 0;
  let movies: Awaited<ReturnType<typeof searchMovies>>['results'] = [];
  let failed = false;
  try {
    const data = await searchMovies(q);
    movies = data.results;
    count = data.total_results;
  } catch (err) {
    console.error('[search]', err);
    failed = true;
  }

  if (failed) {
    return (
      <p role="alert" className="mt-8 text-sm text-red-400">
        검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
    );
  }

  return (
    <section aria-live="polite" className="mt-4">
      <p className="text-sm text-muted">총 {count.toLocaleString()}건</p>
      {movies.length === 0 ? (
        <p className="mt-8 text-base">
          &lsquo;{q}&rsquo;에 대한 검색 결과가 없습니다.
        </p>
      ) : (
        <MovieGrid movies={movies} />
      )}
    </section>
  );
}
