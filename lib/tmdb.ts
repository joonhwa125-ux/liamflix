import type {
  MovieCredits,
  MovieDetail,
  MovieListResponse,
  MovieVideos,
  Period,
} from './types';
import { periodToDateRange } from './periods';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const DEFAULT_LANG = 'ko-KR';
const DEFAULT_REGION = 'KR';

// Image base URLs (TMDB serves these from a separate CDN). These sizes are
// stable for years and don't require a /configuration call on every request.
export const TMDB_IMAGE = {
  poster: (path: string | null, size: 'w185' | 'w342' | 'w500' = 'w342') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
  backdrop: (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
  profile: (path: string | null, size: 'w185' | 'h632' = 'w185') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
};

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      'TMDB_API_KEY is not set. Add it to .env.local (local) or your Vercel project env vars (production).'
    );
  }
  return key;
}

type FetchOpts = {
  params?: Record<string, string | number | boolean | undefined>;
  // Cache behavior. Default: revalidate every hour. Detail pages can opt for longer.
  revalidate?: number;
};

export class TmdbHttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'TmdbHttpError';
  }
}

async function tmdbFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', getApiKey());
  url.searchParams.set('language', DEFAULT_LANG);
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url, {
    next: { revalidate: opts.revalidate ?? 60 * 60 },
  });

  if (!res.ok) {
    throw new TmdbHttpError(res.status, `TMDB ${path} failed: ${res.status} ${res.statusText}`);
  }

  // TMDB sometimes returns a 200 with `{ success: false, status_message }`.
  const json: unknown = await res.json();
  if (
    json &&
    typeof json === 'object' &&
    'success' in json &&
    (json as { success: unknown }).success === false
  ) {
    const msg = (json as { status_message?: string }).status_message ?? 'TMDB error';
    throw new TmdbHttpError(500, msg);
  }
  return json as T;
}

// --- Discover-based curation ------------------------------------------------

type DiscoverArgs = {
  period?: Period;
  withOriginCountry?: string; // e.g., 'KR'
  withoutOriginCountry?: string;
  withGenres?: number | string;
  sortBy?:
    | 'popularity.desc'
    | 'release_date.desc'
    | 'vote_average.desc'
    | 'primary_release_date.desc';
  voteCountGte?: number;
  page?: number;
};

export async function discoverMovies(args: DiscoverArgs): Promise<MovieListResponse> {
  const params: Record<string, string | number | boolean | undefined> = {
    sort_by: args.sortBy ?? 'popularity.desc',
    include_adult: false,
    include_video: false,
    region: DEFAULT_REGION,
    page: args.page ?? 1,
  };

  if (args.period) {
    const { gte, lte } = periodToDateRange(args.period);
    params['primary_release_date.gte'] = gte;
    params['primary_release_date.lte'] = lte;
  }
  if (args.withOriginCountry) params.with_origin_country = args.withOriginCountry;
  if (args.withGenres !== undefined) params.with_genres = args.withGenres;
  if (args.voteCountGte !== undefined) params['vote_count.gte'] = args.voteCountGte;

  // TMDB has no `without_origin_country`. We approximate "foreign" by excluding
  // KR via with_origin_country=... which TMDB does not support either, so for
  // foreign rows we instead exclude Korean-language results client-side after
  // fetching popular movies in the date range.
  const data = await discoverMoviesRaw(params);

  if (args.withoutOriginCountry) {
    const exclude = args.withoutOriginCountry;
    data.results = data.results.filter((m) => {
      // best-effort filter: TMDB list response doesn't include origin_country,
      // so use original_language as a proxy ('ko' for Korean).
      if (exclude === 'KR') return m.original_language !== 'ko';
      return true;
    });
  }

  return data;
}

async function discoverMoviesRaw(
  params: Record<string, string | number | boolean | undefined>
): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>('/discover/movie', { params });
}

// --- Specific lists ---------------------------------------------------------

export async function nowPlaying(page = 1): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>('/movie/now_playing', {
    params: { page, region: DEFAULT_REGION },
  });
}

export async function upcoming(page = 1): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>('/movie/upcoming', {
    params: { page, region: DEFAULT_REGION },
  });
}

export async function popular(page = 1): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>('/movie/popular', {
    params: { page, region: DEFAULT_REGION },
  });
}

// --- Detail / credits / videos / recommendations ---------------------------

export async function movieDetail(id: number | string): Promise<MovieDetail> {
  return tmdbFetch<MovieDetail>(`/movie/${id}`, { revalidate: 60 * 60 * 24 });
}

export async function movieCredits(id: number | string): Promise<MovieCredits> {
  return tmdbFetch<MovieCredits>(`/movie/${id}/credits`, { revalidate: 60 * 60 * 24 });
}

export async function movieVideos(id: number | string): Promise<MovieVideos> {
  return tmdbFetch<MovieVideos>(`/movie/${id}/videos`, { revalidate: 60 * 60 * 24 });
}

export async function movieRecommendations(id: number | string): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>(`/movie/${id}/recommendations`, {
    revalidate: 60 * 60 * 6,
  });
}

// --- Search -----------------------------------------------------------------

export async function searchMovies(query: string, page = 1): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>('/search/movie', {
    params: { query, page, include_adult: false, region: DEFAULT_REGION },
    revalidate: 60 * 5,
  });
}

// --- Genres -----------------------------------------------------------------

export const KOREAN_GENRES = {
  action: 28,
  romance: 10749,
  thriller: 53,
  comedy: 35,
  animation: 16,
  drama: 18,
  horror: 27,
  mystery: 9648,
} as const;

export type GenreSlug = keyof typeof KOREAN_GENRES;

export const GENRE_LABELS: Record<GenreSlug, string> = {
  action: '액션',
  romance: '로맨스',
  thriller: '스릴러',
  comedy: '코미디',
  animation: '애니메이션',
  drama: '드라마',
  horror: '공포',
  mystery: '미스터리',
};
