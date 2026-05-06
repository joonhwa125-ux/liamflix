export default function MovieDetailLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">영화 정보를 불러오는 중</span>
      <div className="-mt-16 h-[60vh] w-full animate-pulse bg-surface" />
      <div className="mx-auto max-w-screen-2xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-6 w-32 animate-pulse rounded bg-surface" />
        <div className="h-24 w-full max-w-3xl animate-pulse rounded bg-surface" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
