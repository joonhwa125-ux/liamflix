import Image from 'next/image';
import Link from 'next/link';
import type { MovieListItem } from '@/lib/types';
import { TMDB_IMAGE } from '@/lib/tmdb';

type Props = {
  movie: MovieListItem;
  /**
   * 'carousel' = fixed pixel widths for use inside horizontal scrollers.
   * 'grid'     = fluid width for grid layouts (search results).
   */
  variant?: 'carousel' | 'grid';
};

export function MovieCard({ movie, variant = 'carousel' }: Props) {
  const posterUrl = TMDB_IMAGE.poster(movie.poster_path, 'w342');
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '';

  // The link's aria-label already names the movie, year and rating, so the
  // visible h3 is removed from the heading outline (role="presentation") to
  // avoid polluting the page outline with hundreds of duplicate entries.
  const ratingLabel = rating ? `, TMDB 평점 ${rating}점` : '';
  const yearLabel = year ? `, ${year}년` : '';

  const widthClasses =
    variant === 'grid'
      ? 'w-full'
      : 'w-[160px] flex-none sm:w-[180px] md:w-[200px]';

  return (
    <Link
      href={`/movie/${movie.id}`}
      aria-label={`${movie.title}${yearLabel}${ratingLabel}, 상세 보기`}
      className={`group block ${widthClasses} focus:outline-none`}
    >
      <article>
        <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-surface ring-1 ring-white/5 motion-safe:transition-transform motion-safe:group-hover:scale-[1.03] motion-safe:group-focus-visible:scale-[1.03] group-focus-visible:ring-2 group-focus-visible:ring-white">
          {/* Fallback layer — always rendered behind the poster. Visible when
              poster_path is null OR when TMDB returned a path whose image
              actually 404s (common for upcoming/new releases). */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center text-muted"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="17" x2="22" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
            </svg>
            <span className="text-xs">포스터 준비 중</span>
          </div>
          {posterUrl && (
            <Image
              src={posterUrl}
              alt=""
              fill
              sizes={
                variant === 'grid'
                  ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
                  : '(max-width: 640px) 160px, (max-width: 1024px) 180px, 200px'
              }
              className="object-cover"
            />
          )}
          {rating && (
            <div className="absolute bottom-2 left-2 z-10 rounded bg-black/70 px-2 py-0.5 text-xs font-medium">
              <span aria-hidden="true">★ {rating}</span>
            </div>
          )}
        </div>
        <h3 role="presentation" className="mt-2 line-clamp-2 text-sm font-medium text-white">
          {movie.title}
        </h3>
        {year && <p className="text-xs text-muted">{year}</p>}
      </article>
    </Link>
  );
}
