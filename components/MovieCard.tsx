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
          {posterUrl ? (
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
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full w-full items-center justify-center text-xs text-muted"
            >
              포스터 없음
            </div>
          )}
          {rating && (
            <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium">
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
