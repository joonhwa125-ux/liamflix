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
