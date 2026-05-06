import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  TMDB_IMAGE,
  TmdbHttpError,
  personDetailFull,
  personBiographyEn,
} from '@/lib/tmdb';
import type {
  PersonDetailFull,
  PersonMovieCast,
  MovieListItem,
} from '@/lib/types';
import { MovieGrid } from '@/components/MovieGrid';

export const revalidate = 86400; // 24h

type Params = { params: { id: string } };

function isValidId(id: string): boolean {
  return /^\d+$/.test(id);
}

async function loadDetail(id: string): Promise<PersonDetailFull | null> {
  if (!isValidId(id)) return null;
  try {
    return await personDetailFull(id);
  } catch (err) {
    if (err instanceof TmdbHttpError && err.status === 404) return null;
    throw err;
  }
}

function calculateAge(birthday: string | null, deathday: string | null): number | null {
  if (!birthday) return null;
  const birth = new Date(birthday);
  if (Number.isNaN(birth.getTime())) return null;
  const end = deathday ? new Date(deathday) : new Date();
  if (Number.isNaN(end.getTime())) return null;
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

function formatDateKo(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function localizedDepartment(dept: string | null): string {
  switch (dept) {
    case 'Acting':
      return '연기';
    case 'Directing':
      return '연출';
    case 'Writing':
      return '각본';
    case 'Production':
      return '제작';
    case 'Sound':
      return '음향';
    case 'Camera':
      return '촬영';
    case 'Editing':
      return '편집';
    case 'Art':
      return '미술';
    case 'Costume & Make-Up':
      return '의상 · 분장';
    case 'Visual Effects':
      return '시각효과';
    case 'Crew':
      return '제작 스태프';
    default:
      return dept ?? '';
  }
}

// Convert PersonMovieCast → MovieListItem so we can reuse MovieGrid/MovieCard.
function castToListItem(c: PersonMovieCast): MovieListItem {
  return {
    id: c.id,
    title: c.title,
    original_title: c.original_title,
    overview: '',
    poster_path: c.poster_path,
    backdrop_path: null,
    release_date: c.release_date,
    vote_average: c.vote_average,
    vote_count: 0,
    genre_ids: [],
    original_language: '',
    popularity: 0,
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const detail = await loadDetail(params.id);
  if (!detail) return { title: '인물을 찾을 수 없습니다 | LiamFlix' };
  const description = (detail.biography || '').replace(/\s+/g, ' ').slice(0, 160);
  const ogImage = TMDB_IMAGE.profile(detail.profile_path, 'h632');
  return {
    title: `${detail.name} | LiamFlix`,
    description,
    openGraph: {
      title: detail.name,
      description,
      type: 'profile',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function PersonDetailPage({ params }: Params) {
  if (!isValidId(params.id)) notFound();

  const detail = await loadDetail(params.id);
  if (!detail) notFound();

  // Fall back to English biography when the Korean one is empty (common case
  // for international actors on TMDB-KR).
  let biography = detail.biography?.trim() ?? '';
  if (!biography) {
    biography = (await personBiographyEn(params.id)) ?? '';
  }

  const profile = TMDB_IMAGE.profile(detail.profile_path, 'h632');
  const age = calculateAge(detail.birthday, detail.deathday);
  const birthdayText = formatDateKo(detail.birthday);
  const deathdayText = formatDateKo(detail.deathday);
  const department = localizedDepartment(detail.known_for_department);

  // Filmography: dedupe by movie id, sort by release date desc, drop entries
  // without a poster or release date for cleanliness.
  const filmographyRaw = detail.movie_credits?.cast ?? [];
  const seen = new Set<number>();
  const filmography = filmographyRaw
    .filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return Boolean(c.poster_path && c.release_date);
    })
    .sort((a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''));

  const filmographyAsMovies = filmography.map(castToListItem);

  return (
    <article className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-[240px_1fr] md:gap-10">
        {/* Profile image */}
        <div>
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-surface ring-1 ring-white/5">
            {profile ? (
              <Image
                src={profile}
                alt={`${detail.name} 프로필`}
                fill
                priority
                sizes="(max-width: 768px) 80vw, 240px"
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-full w-full items-center justify-center text-sm text-muted"
              >
                사진 없음
              </div>
            )}
          </div>
        </div>

        {/* Header info */}
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{detail.name}</h1>

          <dl className="mt-4 space-y-2 text-sm">
            {department && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted">분야</dt>
                <dd className="text-white/90">{department}</dd>
              </div>
            )}
            {birthdayText && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted">출생</dt>
                <dd className="text-white/90">
                  {birthdayText}
                  {age !== null && !detail.deathday && (
                    <span className="ml-2 text-muted">({age}세)</span>
                  )}
                </dd>
              </div>
            )}
            {deathdayText && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted">사망</dt>
                <dd className="text-white/90">
                  {deathdayText}
                  {age !== null && (
                    <span className="ml-2 text-muted">(향년 {age}세)</span>
                  )}
                </dd>
              </div>
            )}
            {detail.place_of_birth && (
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-muted">출생지</dt>
                <dd className="text-white/90">{detail.place_of_birth}</dd>
              </div>
            )}
          </dl>

          {biography && (
            <section aria-labelledby="bio-heading" className="mt-6">
              <h2 id="bio-heading" className="mb-2 text-lg font-semibold">
                약력
              </h2>
              <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-white/90">
                {biography}
              </p>
            </section>
          )}
        </div>
      </div>

      {/* Filmography */}
      {filmographyAsMovies.length > 0 && (
        <section aria-labelledby="filmography-heading" className="mt-12">
          <h2 id="filmography-heading" className="mb-4 text-xl font-semibold">
            출연작{' '}
            <span className="text-base font-normal text-muted">
              {filmographyAsMovies.length}편
            </span>
          </h2>
          <MovieGrid movies={filmographyAsMovies} />
        </section>
      )}
    </article>
  );
}
