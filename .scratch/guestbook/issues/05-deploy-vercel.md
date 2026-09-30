# 05: GitHub + Vercel 배포

**What to build:** 방명록이 Vercel 배포 주소에서 동작한다. GitHub 저장소와 연결되어 이후 push마다 자동 배포된다. 기능이 다 쌓이기 전에 배포 환경 문제(환경 변수, DB 연결)를 일찍 드러내는 것이 목적이다. 스펙: `.scratch/guestbook/spec.md`.

**Blocked by:** 01 (방명록 목록 보기)

**Status:** ready-for-agent

- [ ] 에이전트: `npm run build`와 `npm test`가 통과하는 상태로 커밋을 정리한다 (`.env.local`은 커밋되지 않음을 확인)
- [ ] 에이전트: 사용자가 할 단계를 순서대로 안내한다
- [ ] 사용자: GitHub 저장소를 만들고 remote 추가 후 push한다
- [ ] 사용자: Vercel에서 저장소를 import하고 환경 변수 `DATABASE_URL`을 설정한다
- [ ] 배포 URL에서 배너와 목록(또는 빈 상태)이 보이고 DB 조회가 성공한다
- [ ] 이후 push 시 자동 배포되는 것을 확인한다
