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
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {pending ? "남기는 중…" : "남기기"}
      </button>
    </form>
  );
}
