export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="mt-16 border-t border-white/5 bg-bg py-8 text-sm text-muted"
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <p>
          이 사이트는{' '}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            TMDB
          </a>{' '}
          API를 사용하지만 TMDB가 보증·후원하지 않습니다.
        </p>
        <p className="mt-1">© {new Date().getFullYear()} LiamFlix</p>
      </div>
    </footer>
  );
}
