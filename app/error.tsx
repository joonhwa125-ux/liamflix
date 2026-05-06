'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-screen-md px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">문제가 발생했습니다</h1>
      <p className="mt-3 text-muted">잠시 후 다시 시도해주세요.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
      >
        다시 시도
      </button>
    </div>
  );
}
