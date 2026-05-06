import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'LiamFlix — 최신 영화 둘러보기',
  description:
    'TMDB 데이터로 최신 영화를 기간별·테마별로 둘러보는 사이트. 한국 영화, 해외 영화, 장르별 큐레이션과 평점, 예고편을 한 곳에서.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    title: 'LiamFlix',
    description: '최신 영화를 기간별로 둘러보세요',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <a
          href="#main-content"
          className="sr-only-focusable fixed left-4 top-4 z-50 rounded bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          본문으로 건너뛰기
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
