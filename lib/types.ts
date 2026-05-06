// Common TMDB types — only the fields we actually consume.

export type MovieListItem = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
};

export type MovieListResponse = {
  page: number;
  results: MovieListItem[];
  total_pages: number;
  total_results: number;
};

export type Genre = { id: number; name: string };

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
};

export type CrewMember = {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
};

export type MovieCredits = {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
};

export type MovieVideo = {
  id: string;
  key: string;
  name: string;
  site: 'YouTube' | string;
  type: string;
  official: boolean;
  iso_639_1: string;
};

export type MovieVideos = { id: number; results: MovieVideo[] };

export type MovieDetail = {
  id: number;
  title: string;
  original_title: string;
  tagline: string | null;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  genres: Genre[];
  vote_average: number;
  vote_count: number;
  status: string;
  homepage: string | null;
  original_language: string;
  production_countries: { iso_3166_1: string; name: string }[];
};

// --- watch/providers (JustWatch) -------------------------------------------

export type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
};

export type WatchProviderRegion = {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  ads?: WatchProvider[];
  free?: WatchProvider[];
};

export type WatchProvidersResponse = {
  id: number;
  results: Record<string, WatchProviderRegion | undefined>;
};

// --- release_dates (KR certification) --------------------------------------

export type ReleaseDateEntry = {
  certification: string;
  iso_639_1: string;
  release_date: string;
  type: number; // 1 Premiere, 2 Theatrical (limited), 3 Theatrical, 4 Digital, 5 Physical, 6 TV
  note?: string;
};

export type ReleaseDatesResult = {
  iso_3166_1: string;
  release_dates: ReleaseDateEntry[];
};

export type ReleaseDatesResponse = {
  id: number;
  results: ReleaseDatesResult[];
};

// Detail with append_to_response — single network call surfacing everything
// the detail page needs.
export type MovieDetailFull = MovieDetail & {
  credits?: MovieCredits;
  videos?: MovieVideos;
  recommendations?: MovieListResponse;
  'watch/providers'?: WatchProvidersResponse;
  release_dates?: ReleaseDatesResponse;
};

// --- Person -----------------------------------------------------------------

export type PersonDetail = {
  id: number;
  name: string;
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  gender: number; // 0 unknown, 1 female, 2 male, 3 non-binary
  known_for_department: string | null;
  profile_path: string | null;
  popularity: number;
  homepage: string | null;
};

export type PersonMovieCast = {
  id: number;
  title: string;
  original_title: string;
  character: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
};

export type PersonMovieCrew = {
  id: number;
  title: string;
  original_title: string;
  job: string;
  department: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
};

export type PersonMovieCredits = {
  id: number;
  cast: PersonMovieCast[];
  crew: PersonMovieCrew[];
};

export type PersonExternalIds = {
  id: number;
  imdb_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
  facebook_id: string | null;
};

export type PersonDetailFull = PersonDetail & {
  movie_credits?: PersonMovieCredits;
  external_ids?: PersonExternalIds;
};

// App-side curation types ----------------------------------------------------

export type Period = '1m' | '3m' | '6m' | '12m';

export type RowCategory =
  | 'new_release'
  | 'korean'
  | 'foreign'
  | 'top_rated_recent'
  | 'now_playing'
  | 'upcoming'
  | 'genre';
