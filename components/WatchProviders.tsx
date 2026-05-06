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

function ProviderRow({ providers }: { providers: WatchProvider[] }) {
  return (
    <ul role="list" className="flex flex-wrap gap-2">
      {providers.map((p) => {
        const logo = watchProviderLogo(p.logo_path, 'w92');
        return (
          <li
            key={p.provider_id}
            className="flex items-center gap-2 rounded-md bg-surface px-2 py-1.5 ring-1 ring-white/10"
          >
            {logo ? (
              <Image
                src={logo}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded"
                unoptimized
              />
            ) : (
              <div aria-hidden="true" className="h-7 w-7 rounded bg-surface-2" />
            )}
            <span className="text-sm">{p.provider_name}</span>
          </li>
        );
      })}
    </ul>
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
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="watch-heading" className="text-xl font-semibold">
          어디서 볼까
        </h2>
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
      <p className="mt-3 text-xs text-muted/80">
        제공처 정보는 JustWatch 기준이며 실제 시청 가능 여부는 변동될 수 있습니다.
      </p>
    </section>
  );
}
