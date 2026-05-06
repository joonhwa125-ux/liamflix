import type {
  MovieCredits,
  MovieDetail,
  MovieDetailFull,
  MovieListResponse,
  MovieVideos,
  Period,
  PersonDetailFull,
  ReleaseDateEntry,
  ReleaseDatesResponse,
  WatchProviderRegion,
  WatchProvidersResponse,
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
  /** TMDB watch provider id(s). Use with watchRegion (defaults to KR). */
  withWatchProviders?: number | string;
  watchRegion?: string;
  /** Certification country for `certification.lte` (e.g., 'KR'). */
  certificationCountry?: string;
  /** Maximum certification (e.g., '12' to include 전체관람가/12세 only). */
  certificationLte?: string;
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
  if (args.withWatchProviders !== undefined) {
    params.with_watch_providers = args.withWatchProviders;
    // TMDB requires watch_region whenever with_watch_providers is set.
    params.watch_region = args.watchRegion ?? DEFAULT_REGION;
    // Limit to monetization types most users care about (subscription/free/ads).
    params.with_watch_monetization_types = 'flatrate|free|ads';
  }
  if (args.certificationCountry) params.certification_country = args.certificationCountry;
  if (args.certificationLte) params['certification.lte'] = args.certificationLte;

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

export type TrendingWindow = 'day' | 'week';

export async function trendingMovies(
  window: TrendingWindow = 'week',
  page = 1
): Promise<MovieListResponse> {
  // /trending doesn't accept `region`. Rotation is handled server-side by TMDB.
  // Refresh hourly for 'day', every 6h for 'week'.
  return tmdbFetch<MovieListResponse>(`/trending/movie/${window}`, {
    params: { page },
    revalidate: window === 'day' ? 60 * 60 : 60 * 60 * 6,
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

// Single-call detail loader: combines /movie/{id} with credits, videos,
// recommendations, watch/providers and release_dates via append_to_response.
// Replaces 4–5 separate TMDB requests on the detail page with one.
export async function movieDetailFull(id: number | string): Promise<MovieDetailFull> {
  return tmdbFetch<MovieDetailFull>(`/movie/${id}`, {
    params: {
      append_to_response: 'credits,videos,recommendations,watch/providers,release_dates',
    },
    // OTT availability changes more often than core detail; cap at 6h so the
    // providers section doesn't go stale for a full day.
    revalidate: 60 * 60 * 6,
  });
}

// --- Person -----------------------------------------------------------------

// Single-call person loader: combines /person/{id} with movie_credits and
// external_ids via append_to_response. Returns 404 → caller maps to notFound().
export async function personDetailFull(id: number | string): Promise<PersonDetailFull> {
  return tmdbFetch<PersonDetailFull>(`/person/${id}`, {
    params: { append_to_response: 'movie_credits,external_ids' },
    revalidate: 60 * 60 * 24,
  });
}

// TMDB Korean biographies are frequently empty. Fetches the English biography
// as a fallback when the localized one is missing.
export async function personBiographyEn(id: number | string): Promise<string | null> {
  try {
    const url = new URL(`${TMDB_BASE}/person/${id}`);
    url.searchParams.set('api_key', getApiKey());
    url.searchParams.set('language', 'en-US');
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { biography?: string };
    return json.biography?.trim() || null;
  } catch {
    return null;
  }
}

// --- watch/providers (JustWatch) -------------------------------------------

export async function movieWatchProviders(
  id: number | string
): Promise<WatchProvidersResponse> {
  return tmdbFetch<WatchProvidersResponse>(`/movie/${id}/watch/providers`, {
    revalidate: 60 * 60 * 6,
  });
}

export function pickWatchProviders(
  res: WatchProvidersResponse | null | undefined,
  region = DEFAULT_REGION
): WatchProviderRegion | null {
  if (!res?.results) return null;
  return res.results[region] ?? null;
}

// TMDB serves provider logos on the same image CDN.
export function watchProviderLogo(path: string | null, size: 'w45' | 'w92' = 'w92'): string | null {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

// --- release_dates (KR certification) --------------------------------------

export async function movieReleaseDates(
  id: number | string
): Promise<ReleaseDatesResponse> {
  return tmdbFetch<ReleaseDatesResponse>(`/movie/${id}/release_dates`, {
    revalidate: 60 * 60 * 24,
  });
}

// Returns the KR theatrical certification (e.g. "12", "15", "18", "ALL") if
// available. Falls back to the first non-empty KR certification across types.
export function pickKrCertification(
  res: ReleaseDatesResponse | null | undefined
): string | null {
  if (!res?.results) return null;
  const kr = res.results.find((r) => r.iso_3166_1 === 'KR');
  if (!kr || kr.release_dates.length === 0) return null;
  // Type 3 is theatrical; prefer it, then any with non-empty certification.
  const theatrical = kr.release_dates.find(
    (d: ReleaseDateEntry) => d.type === 3 && d.certification?.trim()
  );
  if (theatrical) return theatrical.certification.trim();
  const any = kr.release_dates.find((d: ReleaseDateEntry) => d.certification?.trim());
  return any ? any.certification.trim() : null;
}

// Korean-friendly label for a TMDB certification code.
export function formatKrCertification(cert: string | null): string | null {
  if (!cert) return null;
  const c = cert.toUpperCase();
  switch (c) {
    case 'ALL':
    case 'G':
      return '전체관람가';
    case '12':
      return '12세';
    case '15':
      return '15세';
    case '18':
    case '19':
    case 'R':
      return '청소년관람불가';
    default:
      // Some entries arrive as "12세 이상 관람가" already — pass through.
      return cert;
  }
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

// --- Korean OTT providers (TMDB / JustWatch ids) ----------------------------
// IDs are stable across TMDB; verified against /watch/providers/movie?watch_region=KR.
export const KR_OTT_PROVIDERS = {
  netflix: 8,
  disney_plus: 337,
  tving: 1881,
  wavve: 1883,
  coupang_play: 356,
  watcha: 97,
  apple_tv_plus: 350,
} as const;

export type KrOttSlug = keyof typeof KR_OTT_PROVIDERS;

export const KR_OTT_LABELS: Record<KrOttSlug, string> = {
  netflix: '넷플릭스',
  disney_plus: '디즈니플러스',
  tving: '티빙',
  wavve: '웨이브',
  coupang_play: '쿠팡플레이',
  watcha: '왓챠',
  apple_tv_plus: 'Apple TV+',
};
