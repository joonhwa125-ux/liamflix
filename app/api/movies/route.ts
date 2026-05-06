import { NextResponse } from 'next/server';
import {
  KOREAN_GENRES,
  type GenreSlug,
  discoverMovies,
  nowPlaying,
  popular,
  upcoming,
} from '@/lib/tmdb';
import { isPeriod } from '@/lib/periods';
import type { MovieListResponse, Period } from '@/lib/types';

export const revalidate = 3600;

const VALID_KINDS = new Set([
  'new_release',
  'korean',
  'foreign',
  'top_rated_recent',
  'now_playing',
  'upcoming',
  'popular',
  'genre',
]);

function isGenreSlug(v: string): v is GenreSlug {
  return v in KOREAN_GENRES;
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get('kind') ?? 'popular';
  const periodParam = searchParams.get('period');
  const genreParam = searchParams.get('genre');

  if (!VALID_KINDS.has(kind)) {
    return NextResponse.json({ error: `Unknown kind: ${kind}` }, { status: 400 });
  }
  const period: Period | undefined = isPeriod(periodParam) ? periodParam : undefined;

  try {
    let data: MovieListResponse;

    switch (kind) {
      case 'new_release':
        data = await discoverMovies({
          period: period ?? '1m',
          sortBy: 'popularity.desc',
        });
        break;
      case 'korean':
        data = await discoverMovies({
          period: period ?? '3m',
          withOriginCountry: 'KR',
          sortBy: 'popularity.desc',
        });
        break;
      case 'foreign':
        data = await discoverMovies({
          period: period ?? '3m',
          withoutOriginCountry: 'KR',
          sortBy: 'popularity.desc',
        });
        break;
      case 'top_rated_recent':
        data = await discoverMovies({
          period: period ?? '6m',
          sortBy: 'vote_average.desc',
          voteCountGte: 100,
        });
        break;
      case 'genre':
        if (!genreParam || !isGenreSlug(genreParam)) {
          return NextResponse.json({ error: 'Invalid genre' }, { status: 400 });
        }
        data = await discoverMovies({
          period: period ?? '6m',
          withGenres: KOREAN_GENRES[genreParam],
          sortBy: 'popularity.desc',
        });
        break;
      case 'now_playing':
        data = await nowPlaying();
        break;
      case 'upcoming':
        data = await upcoming();
        break;
      case 'popular':
      default:
        data = await popular();
        break;
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    // Don't leak internal error details (env var names, stack traces) in prod.
    const isDev = process.env.NODE_ENV === 'development';
    const message =
      isDev && err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.';
    if (!isDev) console.error('[/api/movies]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
