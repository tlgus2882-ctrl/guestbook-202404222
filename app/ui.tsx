export const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950";

export function ErrorText({ children }: { children?: string | null }) {
  return children ? <p className="mt-1 text-sm text-red-600">{children}</p> : null;
}
