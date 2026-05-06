import type { MovieListItem } from '@/lib/types';
import { MovieCard } from './MovieCard';

export function MovieGrid({ movies }: { movies: MovieListItem[] }) {
  if (movies.length === 0) return null;
  return (
    <ul
      role="list"
      className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-4 px-4 py-4 sm:grid-cols-3 sm:px-6 md:grid-cols-4 lg:grid-cols-5 lg:px-8 xl:grid-cols-6"
    >
      {movies.map((m) => (
        <li key={m.id}>
          <MovieCard movie={m} variant="grid" />
        </li>
      ))}
    </ul>
  );
}
