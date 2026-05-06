export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8">
      <span className="sr-only">불러오는 중</span>
      <div className="h-[40vh] w-full animate-pulse rounded-md bg-surface" />
      <div className="mt-8 space-y-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-5 w-40 animate-pulse rounded bg-surface" />
            <div className="mt-3 flex gap-3">
              {[0, 1, 2, 3, 4, 5].map((j) => (
                <div
                  key={j}
                  className="h-[270px] w-[180px] flex-none animate-pulse rounded-md bg-surface"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
