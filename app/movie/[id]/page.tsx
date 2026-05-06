import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  TMDB_IMAGE,
  TmdbHttpError,
  formatKrCertification,
  movieDetailFull,
  pickKrCertification,
  pickWatchProviders,
} from '@/lib/tmdb';
import type { MovieDetailFull, MovieVideo } from '@/lib/types';
import { StaticMovieRow } from '@/components/StaticMovieRow';
import { WatchProviders } from '@/components/WatchProviders';
import { TrailerComments } from '@/components/TrailerComments';

export const revalidate = 86400; // 24h

type Params = { params: { id: string } };

function isValidId(id: string): boolean {
  return /^\d+$/.test(id);
}

function pickTrailer(videos: MovieVideo[]): MovieVideo | null {
  const youTubeTrailers = videos.filter(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  );
  if (youTubeTrailers.length === 0) return null;
  return (
    youTubeTrailers.find((v) => v.iso_639_1 === 'ko' && v.official) ??
    youTubeTrailers.find((v) => v.iso_639_1 === 'ko') ??
    youTubeTrailers.find((v) => v.official) ??
    youTubeTrailers[0]
  );
}

async function loadDetail(id: string): Promise<MovieDetailFull | null> {
  if (!isValidId(id)) return null;
  try {
    return await movieDetailFull(id);
  } catch (err) {
    if (err instanceof TmdbHttpError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const detail = await loadDetail(params.id);
  if (!detail) return { title: '영화를 찾을 수 없습니다 | LiamFlix' };
  const description = (detail.tagline || detail.overview || '').slice(0, 160);
  const ogImage = TMDB_IMAGE.backdrop(detail.backdrop_path, 'w1280') ??
    TMDB_IMAGE.poster(detail.poster_path, 'w500');
  return {
    title: `${detail.title} | LiamFlix`,
    description,
    openGraph: {
      title: detail.title,
      description,
      type: 'video.movie',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function MovieDetailPage({ params }: Params) {
  if (!isValidId(params.id)) notFound();

  const detail = await loadDetail(params.id);
  if (!detail) notFound();

  // All sub-resources arrived in the same response via append_to_response.
  const credits = detail.credits ?? null;
  const videos = detail.videos ?? null;
  const recommendations = detail.recommendations ?? null;
  const watchRegion = pickWatchProviders(detail['watch/providers']);
  const krCertRaw = pickKrCertification(detail.release_dates);
  const krCert = formatKrCertification(krCertRaw);

  const trailer = videos ? pickTrailer(videos.results) : null;
  const backdrop = TMDB_IMAGE.backdrop(detail.backdrop_path, 'w1280');
  const poster = TMDB_IMAGE.poster(detail.poster_path, 'w500');
  const rating = detail.vote_average ? detail.vote_average.toFixed(1) : null;
  const year = detail.release_date ? detail.release_date.slice(0, 4) : '';
  const runtimeText = detail.runtime ? `${detail.runtime}분` : '';
  const showOriginal =
    detail.original_title && detail.original_title !== detail.title;

  const directors = (credits?.crew ?? []).filter((c) => c.job === 'Director');
  const cast = (credits?.cast ?? []).slice(0, 16);

  return (
    <article>
      {/* Detail Hero */}
      <section
        aria-labelledby="movie-title"
        className="relative -mt-16 min-h-[60vh] w-full overflow-hidden"
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
          className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/30"
        />
        <div className="relative z-10 mx-auto flex max-w-screen-2xl flex-col gap-6 px-4 pb-10 pt-32 sm:px-6 md:flex-row md:items-end md:gap-10 lg:px-8">
          {poster && (
            <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10 sm:w-48 md:w-56">
              <Image
                src={poster}
                alt={`${detail.title} 포스터`}
                fill
                sizes="(max-width: 768px) 160px, 224px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 id="movie-title" className="text-3xl font-bold sm:text-4xl md:text-5xl">
              {detail.title}
            </h1>
            {showOriginal && (
              <p className="mt-1 text-sm text-muted">{detail.original_title}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
              {year && <span>{year}</span>}
              {runtimeText && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{runtimeText}</span>
                </>
              )}
              {krCert && (
                <>
                  <span aria-hidden="true">•</span>
                  <span
                    className="inline-flex items-center rounded border border-white/20 px-1.5 py-0.5 text-xs font-medium text-white"
                    aria-label={`한국 관람등급 ${krCert}`}
                  >
                    {krCert}
                  </span>
                </>
              )}
              {rating && (
                <>
                  <span aria-hidden="true">•</span>
                  <span aria-label={`TMDB 평점 ${rating}점, 총 ${detail.vote_count}명 평가`}>
                    <span aria-hidden="true">★ {rating}</span>
                    <span className="ml-1 text-xs text-muted/80">({detail.vote_count.toLocaleString()})</span>
                  </span>
                </>
              )}
            </div>
            {detail.genres.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="장르">
                {detail.genres.map((g) => (
                  <li
                    key={g.id}
                    className="rounded-full border border-white/10 bg-surface px-3 py-1 text-xs text-white/90"
                  >
                    {g.name}
                  </li>
                ))}
              </ul>
            )}
            {detail.tagline && (
              <p className="mt-4 italic text-white/80">&ldquo;{detail.tagline}&rdquo;</p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-screen-2xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {/* Overview */}
        {detail.overview && (
          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="mb-3 text-xl font-semibold">
              줄거리
            </h2>
            <p className="max-w-3xl text-base leading-relaxed text-white/90">
              {detail.overview}
            </p>
          </section>
        )}

        {/* Watch providers (KR) */}
        {watchRegion && <WatchProviders region={watchRegion} title={detail.title} />}

        {/* Trailer */}
        {trailer && (
          <section aria-labelledby="trailer-heading">
            <h2 id="trailer-heading" className="mb-3 text-xl font-semibold">
              예고편
            </h2>
            {/* lg 이상에서는 영상 좌측 + 댓글 우측 컬럼. 두 컬럼이 같은
                높이를 가지도록 stretch. lg 미만은 세로 적층. */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black lg:max-w-3xl lg:flex-1">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
                  title={`${detail.title} 예고편`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                  loading="lazy"
                />
              </div>
              {/* YouTube 인기 댓글 — fetched separately so a slow/failed YouTube
                  request never blocks the trailer render. */}
              <div className="w-full lg:w-96 lg:shrink-0 2xl:w-[28rem]">
                <Suspense fallback={null}>
                  <TrailerComments videoId={trailer.key} videoTitle={detail.title} />
                </Suspense>
              </div>
            </div>
          </section>
        )}

        {/* Director + Cast */}
        {(directors.length > 0 || cast.length > 0) && (
          <section aria-labelledby="credits-heading">
            <h2 id="credits-heading" className="mb-4 text-xl font-semibold">
              출연진 및 제작진
            </h2>
            {directors.length > 0 && (
              <p className="mb-4 text-sm text-white/90">
                <span className="text-muted">감독</span>{' '}
                {directors.map((d) => d.name).join(', ')}
              </p>
            )}
            {cast.length > 0 && (
              <ul role="list" className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
                {cast.map((c) => {
                  const profile = TMDB_IMAGE.profile(c.profile_path, 'w185');
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/person/${c.id}`}
                        aria-label={`${c.name}${c.character ? `, ${c.character} 역` : ''}, 인물 상세 보기`}
                        className="group block rounded-md bg-surface p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <div className="relative aspect-[2/3] overflow-hidden rounded bg-surface-2 motion-safe:transition-transform motion-safe:group-hover:scale-[1.03] motion-safe:group-focus-visible:scale-[1.03]">
                          {profile ? (
                            <Image
                              src={profile}
                              alt=""
                              fill
                              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 150px"
                              className="object-cover"
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="flex h-full w-full items-center justify-center text-xs text-muted"
                            >
                              사진 없음
                            </div>
                          )}
                        </div>
                        <p className="mt-2 truncate text-sm font-medium">{c.name}</p>
                        {c.character && (
                          <p className="truncate text-xs text-muted">{c.character} 역</p>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.results.length > 0 && (
        <StaticMovieRow title="비슷한 영화" movies={recommendations.results} />
      )}
    </article>
  );
}
