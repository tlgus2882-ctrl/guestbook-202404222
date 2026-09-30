"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { Entry } from "@/lib/guestbook";
import { formatKst } from "@/lib/format";
import { checkField } from "@/lib/validation";
import { deleteEntryAction, updateMessageAction } from "./actions";
import { ErrorText, inputClass } from "./ui";

const WRONG_PASSWORD = "비밀번호가 일치하지 않습니다.";
const NOT_FOUND = "이미 삭제된 글입니다.";

type Panel = { id: number; mode: "edit" | "delete" } | null;

export function EntryList({ entries }: { entries: Entry[] }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function open(next: Panel) {
    setNotice(null);
    setPanel(next);
  }

  function handleNotFound() {
    setPanel(null);
    setNotice(NOT_FOUND);
  }

  return (
    <section className="flex flex-col gap-3">
      {notice && (
        <p role="status" className="rounded-md bg-amber-100 px-3 py-2 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
          {notice}
        </p>
      )}
      {entries.length === 0 ? (
        <p className="py-10 text-center text-zinc-500">아직 방명록 글이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold break-all">{entry.name}</span>
                <time className="text-sm text-zinc-500" dateTime={entry.createdAt.toISOString()}>
                  {formatKst(entry.createdAt)}
                </time>
                {entry.updatedAt && (
                  <span className="text-xs text-zinc-400">(수정됨 · {formatKst(entry.updatedAt)})</span>
                )}
                <span className="ml-auto flex gap-2 text-sm">
                  <button type="button" onClick={() => open({ id: entry.id, mode: "edit" })} className="text-zinc-500 hover:text-rose-600">
                    수정
                  </button>
                  <button type="button" onClick={() => open({ id: entry.id, mode: "delete" })} className="text-zinc-500 hover:text-red-600">
                    삭제
                  </button>
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words">{entry.message}</p>
              {panel?.id === entry.id && panel.mode === "edit" && (
                <EditPanel entry={entry} onClose={() => setPanel(null)} onNotFound={handleNotFound} />
              )}
              {panel?.id === entry.id && panel.mode === "delete" && (
                <DeletePanel id={entry.id} onClose={() => setPanel(null)} onNotFound={handleNotFound} />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type PanelProps = { id: number; onClose: () => void; onNotFound: () => void };

function EditPanel({ entry, onClose, onNotFound }: Omit<PanelProps, "id"> & { entry: Entry }) {
  const [message, setMessage] = useState(entry.message);
  const [password, setPassword] = useState("");
  const [messageError, setMessageError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = checkField("message", message);
    setMessageError(invalid);
    setPasswordError(null);
    if (invalid) return;

    startTransition(async () => {
      const result = await updateMessageAction(entry.id, message, password);
      if (result.status === "ok") onClose();
      else if (result.status === "not-found") onNotFound();
      else if (result.status === "invalid") setMessageError(result.errors.message ?? null);
      else setPasswordError(WRONG_PASSWORD);
    });
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <label className="block">
        <span className="text-sm font-medium">메시지</span>
        <textarea
          rows={3}
          autoFocus
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputClass}
        />
        <ErrorText>{messageError}</ErrorText>
      </label>
      <label className="block">
        <span className="text-sm font-medium">비밀번호</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <ErrorText>{passwordError}</ErrorText>
      </label>
      <PanelButtons pending={pending} submitLabel="수정" onCancel={onClose} />
    </form>
  );
}

function DeletePanel({ id, onClose, onNotFound }: PanelProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await deleteEntryAction(id, password);
      if (result.status === "ok") onClose();
      else if (result.status === "not-found") onNotFound();
      else setError(WRONG_PASSWORD);
    });
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <label className="block">
        <span className="text-sm font-medium">비밀번호를 입력하면 삭제됩니다</span>
        <input
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>
      <ErrorText>{error}</ErrorText>
      <PanelButtons pending={pending} submitLabel="삭제" danger onCancel={onClose} />
    </form>
  );
}

function PanelButtons({
  pending,
  submitLabel,
  danger = false,
  onCancel,
}: {
  pending: boolean;
  submitLabel: string;
  danger?: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="rounded-md px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
        취소
      </button>
      <button
        type="submit"
        disabled={pending}
        className={`rounded-md px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50 ${
          danger ? "bg-red-600 hover:bg-red-700" : "bg-rose-600 hover:bg-rose-700"
        }`}
      >
        {pending ? "처리 중…" : submitLabel}
      </button>
    </div>
  );
}
