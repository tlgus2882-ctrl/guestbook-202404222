export function Banner() {
  return (
    <header className="relative w-full overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-rose-950">
      <MailboxScene className="pointer-events-none absolute right-0 bottom-0 h-full max-h-56 w-auto opacity-60 sm:right-6 sm:opacity-100" />
      <div className="relative flex flex-col items-start gap-3 px-4 py-8 sm:px-10 sm:py-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-rose-950 sm:text-5xl dark:text-rose-50">
          미니 방명록
        </h1>
        <p className="rounded-full bg-rose-600 px-4 py-1.5 text-lg font-bold text-white shadow-sm sm:text-xl">
          박시현 · 202404222
        </p>
      </div>
    </header>
  );
}

// 배너 오른쪽의 빨간 우체통 일러스트. 장식용이라 스크린 리더에서는 숨긴다.
function MailboxScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 220" className={className} aria-hidden="true">
      {/* 날아다니는 편지 */}
      <g className="fill-white stroke-rose-300" strokeWidth="2">
        <g transform="translate(18 42) rotate(-12)">
          <rect width="34" height="22" rx="3" />
          <path d="M0 2 L17 13 L34 2" fill="none" />
        </g>
        <g transform="translate(62 94) rotate(10) scale(0.7)">
          <rect width="34" height="22" rx="3" />
          <path d="M0 2 L17 13 L34 2" fill="none" />
        </g>
      </g>
      <path d="M40 70 Q 80 20 130 48" fill="none" className="stroke-rose-300" strokeWidth="2" strokeDasharray="4 6" />

      {/* 땅과 풀 */}
      <ellipse cx="170" cy="214" rx="80" ry="10" className="fill-emerald-200 dark:fill-emerald-900" />

      {/* 기둥 */}
      <rect x="160" y="140" width="20" height="76" rx="3" className="fill-amber-800 dark:fill-amber-900" />

      {/* 우체통 몸통 */}
      <path d="M110 150 V92 a60 52 0 0 1 120 0 V150 Z" className="fill-rose-600" />
      <path d="M110 150 V92 a60 52 0 0 1 120 0 V150 Z" fill="none" className="stroke-rose-800" strokeWidth="3" />
      <rect x="104" y="146" width="132" height="10" rx="3" className="fill-rose-800" />

      {/* 투입구와 편지 */}
      <rect x="135" y="88" width="70" height="10" rx="5" className="fill-rose-950" />
      <g transform="translate(152 70) rotate(-8)" className="fill-white stroke-rose-300" strokeWidth="2">
        <rect width="36" height="22" rx="3" />
        <path d="M0 2 L18 13 L36 2" fill="none" />
      </g>

      {/* 앞면 표식 */}
      <circle cx="170" cy="122" r="13" className="fill-amber-300" />
      <path d="M162 118 h16 l-8 7 z M162 118 v10 h16 v-10" fill="none" className="stroke-rose-700" strokeWidth="2" />

      {/* 깃발 */}
      <rect x="229" y="70" width="6" height="56" rx="2" className="fill-amber-400" />
      <path d="M235 70 h22 l-6 8 l6 8 h-22 z" className="fill-amber-400" />
    </svg>
  );
}
