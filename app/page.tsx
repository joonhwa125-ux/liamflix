import {
  GENRE_LABELS,
  KOREAN_GENRES,
  KR_OTT_PROVIDERS,
  discoverMovies,
  nowPlaying,
  popular,
  trendingMovies,
  upcoming,
  type GenreSlug,
} from '@/lib/tmdb';
import type { MovieListItem } from '@/lib/types';
import { Hero } from '@/components/Hero';
import { MovieRow } from '@/components/MovieRow';
import { StaticMovieRow } from '@/components/StaticMovieRow';

export const revalidate = 3600;

// Pick a hero candidate that has a backdrop image. Falls back to first item.
function pickHero(movies: MovieListItem[]): MovieListItem | null {
  if (!movies.length) return null;
  return movies.find((m) => m.backdrop_path) ?? movies[0];
}

async function safe<T>(p: Promise<T>, label: string): Promise<T | null> {
  try {
    return await p;
  } catch (err) {
    console.error(`[home] ${label} failed:`, err);
    return null;
  }
}

export default async function HomePage() {
  // Fire all curation requests in parallel; one failing endpoint should not
  // break the whole page.
  const [
    popularData,
    trendingData,
    newReleaseData,
    koreanData,
    foreignData,
    topRatedData,
    nowPlayingData,
    upcomingData,
    netflixData,
    disneyPlusData,
    familyData,
    actionData,
    romanceData,
    thrillerData,
    animationData,
    dramaData,
  ] = await Promise.all([
    safe(popular(), 'popular'),
    safe(trendingMovies('week'), 'trending_week'),
    safe(discoverMovies({ period: '1m', sortBy: 'popularity.desc' }), 'new_release'),
    safe(
      discoverMovies({ period: '3m', withOriginCountry: 'KR', sortBy: 'popularity.desc' }),
      'korean'
    ),
    safe(
      discoverMovies({ period: '3m', withoutOriginCountry: 'KR', sortBy: 'popularity.desc' }),
      'foreign'
    ),
    safe(
      discoverMovies({ period: '6m', sortBy: 'vote_average.desc', voteCountGte: 100 }),
      'top_rated_recent'
    ),
    safe(nowPlaying(), 'now_playing'),
    safe(upcoming(), 'upcoming'),
    safe(
      discoverMovies({
        withWatchProviders: KR_OTT_PROVIDERS.netflix,
        watchRegion: 'KR',
        sortBy: 'popularity.desc',
      }),
      'ott_netflix'
    ),
    safe(
      discoverMovies({
        withWatchProviders: KR_OTT_PROVIDERS.disney_plus,
        watchRegion: 'KR',
        sortBy: 'popularity.desc',
      }),
      'ott_disney_plus'
    ),
    safe(
      discoverMovies({
        period: '12m',
        certificationCountry: 'KR',
        certificationLte: '12',
        sortBy: 'popularity.desc',
      }),
      'family_friendly'
    ),
    safe(genreFetch('action'), 'genre.action'),
    safe(genreFetch('romance'), 'genre.romance'),
    safe(genreFetch('thriller'), 'genre.thriller'),
    safe(genreFetch('animation'), 'genre.animation'),
    safe(genreFetch('drama'), 'genre.drama'),
  ]);

  const hero = pickHero(popularData?.results ?? []);

  return (
    <>
      {hero ? (
        <Hero movie={hero} />
      ) : (
        <header className="px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">LiamFlix</h1>
          <p className="mt-2 text-muted">현재 영화 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</p>
        </header>
      )}

      <div className="space-y-2 pb-8 pt-6">
        {trendingData && trendingData.results.length > 0 && (
          <StaticMovieRow
            title="🔥 이번 주 트렌딩"
            movies={trendingData.results}
          />
        )}
        {newReleaseData && newReleaseData.results.length > 0 && (
          <MovieRow
            title="🎬 이번 달 신작"
            kind="new_release"
            defaultPeriod="1m"
            initialMovies={newReleaseData.results}
          />
        )}
        {netflixData && netflixData.results.length > 0 && (
          <StaticMovieRow
            title="🅽 넷플릭스에서 볼 수 있는 인기작"
            movies={netflixData.results}
          />
        )}
        {disneyPlusData && disneyPlusData.results.length > 0 && (
          <StaticMovieRow
            title="✨ 디즈니플러스 인기작"
            movies={disneyPlusData.results}
          />
        )}
        {koreanData && koreanData.results.length > 0 && (
          <MovieRow
            title="🇰🇷 한국 영화"
            kind="korean"
            defaultPeriod="3m"
            initialMovies={koreanData.results}
          />
        )}
        {foreignData && foreignData.results.length > 0 && (
          <MovieRow
            title="🌍 해외 영화"
            kind="foreign"
            defaultPeriod="3m"
            initialMovies={foreignData.results}
          />
        )}
        {topRatedData && topRatedData.results.length > 0 && (
          <MovieRow
            title="⭐ 평점 높은 영화"
            kind="top_rated_recent"
            defaultPeriod="6m"
            initialMovies={topRatedData.results}
          />
        )}
        {nowPlayingData && nowPlayingData.results.length > 0 && (
          <MovieRow
            title="🍿 현재 상영작"
            kind="now_playing"
            initialMovies={nowPlayingData.results}
          />
        )}
        {upcomingData && upcomingData.results.length > 0 && (
          <MovieRow
            title="🔜 개봉 예정작"
            kind="upcoming"
            initialMovies={upcomingData.results}
          />
        )}
        {familyData && familyData.results.length > 0 && (
          <StaticMovieRow
            title="👨‍👩‍👧 가족과 함께"
            movies={familyData.results}
          />
        )}
        {actionData && actionData.results.length > 0 && (
          <MovieRow
            title={`💥 ${GENRE_LABELS.action}`}
            kind="genre"
            genre="action"
            defaultPeriod="6m"
            initialMovies={actionData.results}
          />
        )}
        {romanceData && romanceData.results.length > 0 && (
          <MovieRow
            title={`💖 ${GENRE_LABELS.romance}`}
            kind="genre"
            genre="romance"
            defaultPeriod="6m"
            initialMovies={romanceData.results}
          />
        )}
        {thrillerData && thrillerData.results.length > 0 && (
          <MovieRow
            title={`🔪 ${GENRE_LABELS.thriller}`}
            kind="genre"
            genre="thriller"
            defaultPeriod="6m"
            initialMovies={thrillerData.results}
          />
        )}
        {animationData && animationData.results.length > 0 && (
          <MovieRow
            title={`🎨 ${GENRE_LABELS.animation}`}
            kind="genre"
            genre="animation"
            defaultPeriod="6m"
            initialMovies={animationData.results}
          />
        )}
        {dramaData && dramaData.results.length > 0 && (
          <MovieRow
            title={`🎭 ${GENRE_LABELS.drama}`}
            kind="genre"
            genre="drama"
            defaultPeriod="6m"
            initialMovies={dramaData.results}
          />
        )}
      </div>
    </>
  );
}

function genreFetch(slug: GenreSlug) {
  return discoverMovies({
    period: '6m',
    withGenres: KOREAN_GENRES[slug],
    sortBy: 'popularity.desc',
  });
}
