import Link from 'next/link';

export default function PersonNotFound() {
  return (
    <div className="mx-auto max-w-screen-md px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">인물을 찾을 수 없습니다</h1>
      <p className="mt-3 text-muted">요청하신 인물 정보가 존재하지 않거나 삭제되었습니다.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
