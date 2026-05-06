import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBar } from './SearchBar';

export function Header() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-40 border-b border-white/5 bg-bg/80 backdrop-blur"
    >
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="LiamFlix 홈으로 이동"
          className="flex items-center gap-2 font-bold tracking-tight"
        >
          <span className="text-xl text-accent">LIAM</span>
          <span className="text-xl">FLIX</span>
        </Link>

        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-4 text-sm text-muted">
            <li>
              <Link href="/" className="hover:text-white">
                홈
              </Link>
            </li>
          </ul>
        </nav>

        <div className="ml-auto w-full max-w-sm">
          {/* SearchBar uses useSearchParams() — must sit inside Suspense in
              Next 14 App Router so it doesn't bail out the whole tree. */}
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
