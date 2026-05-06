import Image from 'next/image';
import { topComments, formatRelativeKo } from '@/lib/youtube';

type Props = {
  videoId: string;
  videoTitle?: string;
};

export async function TrailerComments({ videoId, videoTitle }: Props) {
  const comments = await topComments(videoId, 3);
  if (comments.length === 0) return null;

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    // lg 이상에서 부모(flex items-stretch)로부터 높이를 받아 트레일러와
    // 동일 높이로 늘어남. 내부는 flex column으로 댓글 카드들이 균등 분포되고
    // 출처 문구는 하단에 고정.
    <section
      aria-labelledby="trailer-comments-heading"
      className="flex h-full flex-col"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 id="trailer-comments-heading" className="text-base font-semibold">
          YouTube 인기 댓글
        </h3>
        <a
          href={watchUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-xs text-muted hover:text-white"
          aria-label={`YouTube에서${videoTitle ? ` ${videoTitle}` : ''} 댓글 더 보기 (새 창)`}
        >
          YouTube에서 보기 ↗
        </a>
      </div>
      <ul
        role="list"
        className="flex flex-1 flex-col gap-3 lg:justify-between lg:gap-2"
      >
        {comments.map((c) => (
          <li
            key={c.id}
            className="rounded-md border border-white/5 bg-surface p-3"
          >
            <div className="flex items-start gap-3">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-2">
                {c.authorProfileImageUrl && (
                  <Image
                    src={c.authorProfileImageUrl}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-medium text-white/90">
                    {c.authorDisplayName}
                  </span>
                  <span className="text-xs text-muted">
                    {formatRelativeKo(c.publishedAt)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-4 whitespace-pre-line text-sm text-white/80">
                  {c.textDisplay}
                </p>
                {c.likeCount > 0 && (
                  <p className="mt-2 text-xs text-muted" aria-label={`좋아요 ${c.likeCount.toLocaleString()}개`}>
                    <span aria-hidden="true">👍</span> {c.likeCount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted/80">
        출처: YouTube. 댓글은 작성자의 의견이며 LiamFlix의 견해와 무관합니다.
      </p>
    </section>
  );
}
