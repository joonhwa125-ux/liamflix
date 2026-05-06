export default function PersonDetailLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <span className="sr-only">인물 정보를 불러오는 중</span>
      <div className="grid gap-8 md:grid-cols-[240px_1fr] md:gap-10">
        <div className="aspect-[2/3] w-full animate-pulse rounded-md bg-surface" />
        <div className="space-y-3">
          <div className="h-9 w-64 animate-pulse rounded bg-surface" />
          <div className="h-4 w-40 animate-pulse rounded bg-surface" />
          <div className="h-4 w-48 animate-pulse rounded bg-surface" />
          <div className="mt-6 h-24 w-full max-w-3xl animate-pulse rounded bg-surface" />
        </div>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded bg-surface" />
        ))}
      </div>
    </div>
  );
}
