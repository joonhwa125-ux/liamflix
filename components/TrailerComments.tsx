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
    <section aria-labelledby="trailer-comments-heading">
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
      <ul role="list" className="space-y-3">
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
      <p className="mt-2 text-[11px] text-muted/80">
        출처: YouTube. 댓글은 작성자의 의견이며 LiamFlix의 견해와 무관합니다.
      </p>
    </section>
  );
}
