import Image from 'next/image';
import { watchProviderLogo } from '@/lib/tmdb';
import type { WatchProvider, WatchProviderRegion } from '@/lib/types';

type Props = {
  region: WatchProviderRegion;
  /** Movie title for the JustWatch attribution link aria. */
  title: string;
};

const SECTIONS: { key: keyof Pick<WatchProviderRegion, 'flatrate' | 'free' | 'ads' | 'rent' | 'buy'>; label: string }[] = [
  { key: 'flatrate', label: '구독으로 보기' },
  { key: 'free', label: '무료' },
  { key: 'ads', label: '광고 시청' },
  { key: 'rent', label: '대여' },
  { key: 'buy', label: '구매' },
];

const DISCLAIMER =
  '제공처 정보는 JustWatch 기준이며 실제 시청 가능 여부는 변동될 수 있습니다.';

function ProviderRow({ providers }: { providers: WatchProvider[] }) {
  return (
    <ul role="list" className="flex flex-wrap gap-2">
      {providers.map((p) => {
        const logo = watchProviderLogo(p.logo_path, 'w92');
        return (
          <li
            key={p.provider_id}
            // Native title gives sighted mouse users a hover label without
            // cluttering the layout; alt on the image gives the same to AT.
            title={p.provider_name}
            className="flex h-12 w-12 items-center justify-center rounded-md bg-surface ring-1 ring-white/10 transition-colors hover:ring-white/30"
          >
            {logo ? (
              <Image
                src={logo}
                alt={p.provider_name}
                width={36}
                height={36}
                className="h-9 w-9 rounded"
                unoptimized
              />
            ) : (
              <span
                role="img"
                aria-label={p.provider_name}
                className="text-[10px] font-medium text-muted"
              >
                {p.provider_name.slice(0, 3).toUpperCase()}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function InfoTooltip({ id, text }: { id: string; text: string }) {
  // Visual-only tooltip pattern: the button has aria-describedby pointing at
  // the tooltip span (role="tooltip"), so screen readers always announce the
  // text when the button receives focus. Sighted users see it on hover/focus.
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        aria-label="제공처 정보 안내"
        aria-describedby={id}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-muted transition-colors hover:border-white/60 hover:text-white focus:border-white/60 focus:text-white"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2zm0 4h2v6h-2z" />
        </svg>
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-md bg-surface-2 px-3 py-2 text-xs leading-relaxed text-white/90 opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

export function WatchProviders({ region, title }: Props) {
  const sections = SECTIONS.filter(({ key }) => {
    const arr = region[key];
    return Array.isArray(arr) && arr.length > 0;
  });
  if (sections.length === 0) return null;

  return (
    <section aria-labelledby="watch-heading">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 id="watch-heading" className="text-xl font-semibold">
          어디서 볼까
        </h2>
        <InfoTooltip id="watch-info-tooltip" text={DISCLAIMER} />
        {region.link && (
          <a
            href={region.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted underline-offset-4 hover:text-white hover:underline"
            aria-label={`${title} JustWatch에서 더 보기 (새 탭)`}
          >
            JustWatch에서 더 보기 →
          </a>
        )}
      </div>
      <div className="space-y-3">
        {sections.map(({ key, label }) => (
          <div key={key}>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              {label}
            </p>
            <ProviderRow providers={region[key]!} />
          </div>
        ))}
      </div>
    </section>
  );
}
