"use server";

import { revalidatePath } from "next/cache";
import { guestbook } from "@/lib/db";
import type { DeleteResult, UpdateResult } from "@/lib/guestbook";
import type { FieldErrors } from "@/lib/validation";

export type CreateFormState = {
  status: "idle" | "ok" | "invalid";
  errors: FieldErrors;
  values: { name: string; message: string };
};

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createEntryAction(_prev: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = { name: text(formData, "name"), message: text(formData, "message"), password: text(formData, "password") };
  const result = await guestbook.createEntry(input);

  if (result.status === "invalid") {
    return { status: "invalid", errors: result.errors, values: { name: input.name, message: input.message } };
  }
  revalidatePath("/");
  return { status: "ok", errors: {}, values: { name: "", message: "" } };
}

// 수정·삭제는 폼이 아니라 목록 안의 인라인 입력칸에서 직접 호출한다.
// Server Action은 UI 밖에서도 POST로 호출될 수 있으므로 id를 다시 확인한다.
export async function deleteEntryAction(id: number, password: string): Promise<DeleteResult> {
  if (!Number.isInteger(id)) return { status: "not-found" };
  const result = await guestbook.deleteEntry(id, String(password));
  if (result.status !== "wrong-password") revalidatePath("/");
  return result;
}

export async function updateMessageAction(id: number, message: string, password: string): Promise<UpdateResult> {
  if (!Number.isInteger(id)) return { status: "not-found" };
  const result = await guestbook.updateMessage(id, String(message), String(password));
  if (result.status === "ok" || result.status === "not-found") revalidatePath("/");
  return result;
}
