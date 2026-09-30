# 01: 방명록 목록 보기 (배너 + 빈 목록 + 테스트 기반)

**What to build:** 방문자가 페이지에 들어오면 왼쪽 상단에 "미니 방명록" 제목과 개발자 배지(박시현 · 202404222)가 배너처럼 크게 보이고, 그 아래에 전체 방명록 글이 작성 시각 최신순으로 나열된다. 방명록 글이 없으면 빈 상태 안내가 보인다. 이 티켓에서 스키마·스키마 적용 스크립트·guestbook 모듈(목록 조회)·테스트 기반(Vitest + PGlite)을 함께 세운다. 스펙: `.scratch/guestbook/spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] 구현 전에 Next.js 16.3 문서(`node_modules/next/dist/docs/`)에서 데이터 조회·렌더링 관련 가이드를 확인했다
- [ ] 스펙의 `entries` 스키마가 SQL 파일로 존재하고, `npm run db:setup`이 `DATABASE_URL`에 재실행 안전하게 적용된다
- [ ] 실제 Neon DB에 `db:setup`을 실행해 테이블 생성을 확인했다
- [ ] guestbook 모듈이 SQL 실행기를 주입받고, 목록 조회가 작성 시각 최신순(동률 시 id 역순)으로 방명록 글을 반환한다
- [ ] 목록 결과에 비밀번호/해시가 포함되지 않는다
- [ ] Vitest + PGlite 테스트 환경이 운영과 같은 스키마 SQL을 적용하며, `npm test`로 실행된다 (실제 Neon은 사용하지 않음)
- [ ] 기본 템플릿 페이지가 방명록 페이지로 교체되고, 왼쪽 상단에 큰 배너(미니 방명록 + 박시현 · 202404222 배지)가 보인다
- [ ] 방명록 글이 없을 때 "아직 방명록 글이 없습니다" 안내가 보인다
- [ ] 각 방명록 글에 이름·메시지(줄바꿈 보존, HTML 미해석)·작성 시각(`Asia/Seoul`, `YYYY-MM-DD HH:mm`)이 표시된다
- [ ] 휴대폰 너비에서 가로 스크롤이 생기지 않는다
