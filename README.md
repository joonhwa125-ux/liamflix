# LiamFlix

TMDB API를 사용해 최신 영화를 기간별·테마별로 둘러보는 Next.js 사이드 프로젝트입니다. 한국어(ko-KR) 우선, 다크 테마, 넷플릭스 스타일의 가로 스크롤 캐러셀 UI.

## 주요 기능

- **메인 큐레이션 row** — 신작(1m), 한국 영화(3m), 해외 영화(3m), 평점 높은(6m), 현재 상영작, 개봉 예정작, 장르별(액션/로맨스/스릴러/애니메이션/드라마)
- **각 row마다 기간 드롭다운** (1개월/3개월/6개월/1년) — 변경 시 클라이언트가 `/api/movies`에 재요청
- **영화 상세 페이지** — 백드롭, 포스터, 줄거리, 평점, 예고편(YouTube), 출연진, 추천 영화
- **검색** — `/search?q=` 라우트, 그리드 레이아웃
- **웹 접근성**
  - 시맨틱 랜드마크 (`<header role="banner">`, `<nav>`, `<main>`, `<footer>`)
  - 본문 건너뛰기(skip nav) 링크
  - 캐러셀 키보드 네비게이션 (←/→, Home/End)
  - 스크롤 경계에서 화살표 버튼 비활성화
  - 라이브 리전(`role="status"`/`aria-live="polite"`)으로 로딩·에러 안내
  - 네이티브 `<select>` (드롭다운)으로 스크린리더·모바일 호환
  - WCAG AA 색대비 충족
  - `prefers-reduced-motion` 존중

## 사전 요구 사항

- Node.js 18.17 이상
- TMDB v3 API 키 — https://www.themoviedb.org/settings/api

## 로컬 개발

```bash
npm install
cp .env.local.example .env.local
# .env.local 파일을 열어 TMDB_API_KEY를 본인 키로 채우세요.
npm run dev
```

- 개발 서버: http://localhost:3000
- 타입 검사: `npm run typecheck`
- 프로덕션 빌드: `npm run build && npm start`

## 환경 변수

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `TMDB_API_KEY` | ✅ | TMDB v3 API 키. **서버에서만** 사용되며 클라이언트 번들로 누출되지 않습니다. |
| `NEXT_PUBLIC_SITE_URL` | ⛔ | 프로덕션 도메인(예: `https://liamflix.vercel.app`). Open Graph/Twitter 이미지 절대 URL 해석에 사용됩니다. |

## Vercel 배포

1. **Repository를 Vercel에 import** — GitHub/GitLab/Bitbucket 연결
2. **Environment Variables 추가** — Project Settings → Environment Variables
   - `TMDB_API_KEY` = 본인 TMDB v3 키 (Production + Preview)
   - `NEXT_PUBLIC_SITE_URL` = 배포 도메인 (선택)
3. **Deploy** — 첫 배포 후 자동 빌드. 캐시는 1시간 ISR(`revalidate=3600`).

> ⚠️ `.env.local`은 절대 Git에 커밋하지 마세요. `.gitignore`에 포함되어 있습니다.

## 아키텍처 메모

- **TMDB 호출은 서버 컴포넌트와 Route Handler에서만** 수행 (`lib/tmdb.ts`). 클라이언트가 기간 드롭다운을 바꾸면 `/api/movies`로 요청해 키를 그대로 보호합니다.
- `Promise.all` + 개별 try/catch로 **row 단위 실패 격리** — 한 endpoint가 실패해도 다른 row는 정상 표시.
- TMDB 404는 `TmdbHttpError`로 래핑해 상세 페이지에서 `notFound()`로 분기.
- ISR 캐시: discover/list류 1시간, 상세는 24시간.

## 알려진 제약

- "해외 영화" row는 TMDB가 `without_origin_country`를 지원하지 않아 `original_language !== 'ko'` 기반 근사치입니다.
- 검색은 페이지네이션이 없는 단일 페이지(첫 20건)만 지원합니다.
- 한국어 메타데이터가 없는 영화는 영문 제목/줄거리로 표시됩니다.

## 데이터 출처

이 사이트는 [The Movie Database (TMDB)](https://www.themoviedb.org/) API를 사용합니다. TMDB가 보증·후원하지 않습니다.
