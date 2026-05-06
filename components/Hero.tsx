import Image from 'next/image';
import Link from 'next/link';
import type { MovieListItem } from '@/lib/types';
import { TMDB_IMAGE } from '@/lib/tmdb';

export function Hero({ movie }: { movie: MovieListItem }) {
  const backdrop = TMDB_IMAGE.backdrop(movie.backdrop_path, 'w1280');
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '';

  return (
    <section
      aria-labelledby="hero-title"
      className="relative -mt-16 h-[60vh] min-h-[400px] w-full overflow-hidden"
    >
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/40 to-transparent"
      />

      <div className="relative z-10 flex h-full items-end pb-12">
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 id="hero-title" className="text-3xl font-bold sm:text-4xl md:text-5xl">
              {movie.title}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted">
              {year && <span>{year}</span>}
              {rating && (
                <span aria-label={`TMDB 평점 ${rating}점`}>
                  <span aria-hidden="true">★ {rating}</span>
                </span>
              )}
            </div>
            {movie.overview && (
              <p className="mt-4 line-clamp-3 max-w-xl text-sm text-white/90 sm:text-base">
                {movie.overview}
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <Link
                href={`/movie/${movie.id}`}
                aria-label={`${movie.title} 자세히 보기`}
                className="rounded bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
              >
                자세히 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
