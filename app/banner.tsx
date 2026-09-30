export function Banner() {
  return (
    <header className="w-full bg-indigo-600 text-white">
      <div className="flex flex-col items-start gap-3 px-4 py-8 sm:px-10 sm:py-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">미니 방명록</h1>
        <p className="rounded-full bg-white px-4 py-1.5 text-lg font-bold text-indigo-700 sm:text-xl">
          박시현 · 202404222
        </p>
      </div>
    </header>
  );
}
