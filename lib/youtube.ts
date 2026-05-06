import type { YoutubeComment } from './types';

const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3';

type CommentThreadItem = {
  id: string;
  snippet: {
    topLevelComment: {
      id: string;
      snippet: {
        authorDisplayName: string;
        authorProfileImageUrl?: string;
        textDisplay: string;
        likeCount: number;
        publishedAt: string;
      };
    };
  };
};

type CommentThreadsResponse = {
  items?: CommentThreadItem[];
  error?: { code: number; message: string; errors?: { reason?: string }[] };
};

// Fetches the top N relevance-ranked top-level comments for a YouTube video.
// Returns [] for any failure mode (missing key, comments disabled, network,
// quota, malformed) so the UI can simply skip the section.
export async function topComments(
  videoId: string,
  maxResults = 3
): Promise<YoutubeComment[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  const url = new URL(`${YOUTUBE_BASE}/commentThreads`);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('videoId', videoId);
  url.searchParams.set('order', 'relevance');
  url.searchParams.set('maxResults', String(Math.min(Math.max(maxResults, 1), 100)));
  url.searchParams.set('textFormat', 'plainText');
  url.searchParams.set('key', key);

  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 6 } });
    if (!res.ok) return [];
    const json = (await res.json()) as CommentThreadsResponse;
    if (json.error || !json.items) return [];
    return json.items.map((item) => {
      const s = item.snippet.topLevelComment.snippet;
      return {
        id: item.snippet.topLevelComment.id,
        authorDisplayName: s.authorDisplayName,
        authorProfileImageUrl: s.authorProfileImageUrl ?? null,
        textDisplay: s.textDisplay,
        likeCount: s.likeCount,
        publishedAt: s.publishedAt,
      };
    });
  } catch {
    return [];
  }
}

// Lightweight relative-time formatter for comment timestamps. Korean output.
// We avoid Intl.RelativeTimeFormat to keep edge cases predictable.
export function formatRelativeKo(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffSec = Math.max(1, Math.floor((now - then) / 1000));
  if (diffSec < 60) return '방금 전';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}일 전`;
  const diffMo = Math.floor(diffDay / 30);
  if (diffMo < 12) return `${diffMo}개월 전`;
  const diffYr = Math.floor(diffDay / 365);
  return `${diffYr}년 전`;
}
