import { connection } from "next/server";
import { guestbook } from "@/lib/db";
import { Banner } from "./banner";
import { EntryForm } from "./entry-form";
import { EntryList } from "./entry-list";

export default async function Home() {
  // 방명록 글은 요청마다 새로 조회한다(빌드 시 정적으로 굳지 않도록).
  await connection();
  const entries = await guestbook.listEntries();

  return (
    <>
      <Banner />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
        <EntryForm />
        <EntryList entries={entries} />
      </main>
    </>
  );
}
