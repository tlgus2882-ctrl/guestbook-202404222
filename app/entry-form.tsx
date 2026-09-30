"use client";

import { useActionState, useState, type FormEvent } from "react";
import { checkFields, hasErrors, type FieldErrors } from "@/lib/validation";
import { createEntryAction, type CreateFormState } from "./actions";
import { ErrorText, inputClass } from "./ui";

const initialState: CreateFormState = { status: "idle", errors: {}, values: { name: "", message: "" } };

export function EntryForm() {
  const [state, formAction, pending] = useActionState(createEntryAction, initialState);
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const errors = clientErrors ?? state.errors;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const found = checkFields({
      name: String(data.get("name") ?? ""),
      message: String(data.get("message") ?? ""),
      password: String(data.get("password") ?? ""),
    });
    if (hasErrors(found)) {
      event.preventDefault();
      setClientErrors(found);
    } else {
      setClientErrors(null);
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="text-lg font-semibold">방명록 글 남기기</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">이름</span>
          <input name="name" defaultValue={state.values.name} className={inputClass} />
          <ErrorText>{errors.name}</ErrorText>
        </label>
        <label className="block">
          <span className="text-sm font-medium">비밀번호</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            className={inputClass}
          />
          <ErrorText>{errors.password}</ErrorText>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">메시지</span>
        <textarea
          name="message"
          rows={3}
          defaultValue={state.values.message}
          className={inputClass}
        />
        <ErrorText>{errors.message}</ErrorText>
      </label>
      <div className="relative self-end">
        {state.sentAt && <FlyingLetter key={state.sentAt} />}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {pending ? "남기는 중…" : "남기기"}
        </button>
      </div>
    </form>
  );
}

// 남기기 버튼에서 날개 달린 편지가 날아오른다. 장식용이라 스크린 리더에서는 숨긴다.
function FlyingLetter() {
  return (
    <svg
      viewBox="0 0 64 48"
      aria-hidden="true"
      className="letter-fly pointer-events-none absolute -top-10 right-0 z-50 h-20 w-24 drop-shadow-lg"
    >
      <path className="wing fill-sky-300 stroke-sky-500" strokeWidth="1.5" d="M18 20 C 8 4, 2 8, 0 14 C 8 14, 12 18, 18 22 Z" />
      <path className="wing fill-sky-300 stroke-sky-500" strokeWidth="1.5" d="M46 20 C 56 4, 62 8, 64 14 C 56 14, 52 18, 46 22 Z" />
      <rect x="14" y="18" width="36" height="24" rx="3" className="fill-white stroke-rose-400" strokeWidth="2" />
      <path d="M14 20 L32 32 L50 20" fill="none" className="stroke-rose-400" strokeWidth="2" />
      <circle cx="32" cy="32" r="3.5" className="fill-rose-500" />
    </svg>
  );
}
