import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import { createGuestbook, type Guestbook } from "./guestbook";

const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

let guestbook: Guestbook;

beforeEach(async () => {
  const db = new PGlite();
  await db.exec(schema);
  guestbook = createGuestbook(async (text, params) => (await db.query<Record<string, unknown>>(text, params)).rows);
});

describe("목록 조회", () => {
  it("방명록 글이 없으면 빈 목록을 반환한다", async () => {
    expect(await guestbook.listEntries()).toEqual([]);
  });
});

describe("작성", () => {
  it("작성한 방명록 글이 목록에 나타나고, 비밀번호는 노출되지 않는다", async () => {
    const result = await guestbook.createEntry({ name: "시현", message: "안녕하세요", password: "1234" });

    expect(result.status).toBe("ok");
    const [entry] = await guestbook.listEntries();
    expect(entry).toMatchObject({ name: "시현", message: "안녕하세요", updatedAt: null });
    expect(entry.createdAt).toBeInstanceOf(Date);
    expect(JSON.stringify(entry)).not.toContain("1234");
    expect(Object.keys(entry).sort()).toEqual(["createdAt", "id", "message", "name", "updatedAt"]);
  });
});

describe("목록 정렬", () => {
  it("작성 시각의 최신순으로 정렬된다", async () => {
    await guestbook.createEntry({ name: "첫째", message: "1", password: "1234" });
    await guestbook.createEntry({ name: "둘째", message: "2", password: "1234" });
    await guestbook.createEntry({ name: "셋째", message: "3", password: "1234" });

    const names = (await guestbook.listEntries()).map((e) => e.name);
    expect(names).toEqual(["셋째", "둘째", "첫째"]);
  });
});

describe("작성 검증", () => {
  const valid = { name: "시현", message: "안녕하세요", password: "1234" };

  it.each([
    ["이름이 비어 있으면", { name: "" }, "name"],
    ["이름이 공백뿐이면", { name: "   " }, "name"],
    ["이름이 21자면", { name: "가".repeat(21) }, "name"],
    ["메시지가 비어 있으면", { message: "" }, "message"],
    ["메시지가 공백뿐이면", { message: " \n " }, "message"],
    ["메시지가 501자면", { message: "가".repeat(501) }, "message"],
    ["비밀번호가 3자면", { password: "123" }, "password"],
    ["비밀번호가 51자면", { password: "a".repeat(51) }, "password"],
  ])("%s 거부되고 저장되지 않는다", async (_, override, field) => {
    const result = await guestbook.createEntry({ ...valid, ...override });

    expect(result.status).toBe("invalid");
    expect(result.status === "invalid" && Object.keys(result.errors)).toEqual([field]);
    expect(await guestbook.listEntries()).toEqual([]);
  });

  it("필드별 오류를 한꺼번에 알려준다", async () => {
    const result = await guestbook.createEntry({ name: "", message: "", password: "" });

    expect(result.status === "invalid" && Object.keys(result.errors).sort()).toEqual(["message", "name", "password"]);
  });

  it("경계 길이(이름 20자, 메시지 500자, 비밀번호 4자·50자)는 허용된다", async () => {
    expect((await guestbook.createEntry({ name: "가".repeat(20), message: "가".repeat(500), password: "1234" })).status).toBe("ok");
    expect((await guestbook.createEntry({ ...valid, password: "a".repeat(50) })).status).toBe("ok");
  });

  it("앞뒤 공백을 잘라서 저장한다", async () => {
    await guestbook.createEntry({ name: "  시현 ", message: "\n 안녕 \n", password: "1234" });

    const [entry] = await guestbook.listEntries();
    expect(entry).toMatchObject({ name: "시현", message: "안녕" });
  });
});

async function write(name = "시현", password = "1234") {
  const result = await guestbook.createEntry({ name, message: "안녕하세요", password });
  if (result.status !== "ok") throw new Error("작성 실패");
  return result.entry;
}

describe("삭제", () => {
  it("올바른 비밀번호로 삭제하면 목록에서 사라진다", async () => {
    const entry = await write();

    expect(await guestbook.deleteEntry(entry.id, "1234")).toEqual({ status: "ok" });
    expect(await guestbook.listEntries()).toEqual([]);
  });

  it("틀린 비밀번호면 거부되고 방명록 글은 남아 있다", async () => {
    const entry = await write();

    expect(await guestbook.deleteEntry(entry.id, "9999")).toEqual({ status: "wrong-password" });
    expect(await guestbook.listEntries()).toHaveLength(1);
  });

  it("작성 때처럼 비밀번호의 앞뒤 공백은 무시한다", async () => {
    const entry = await write("시현", " 1234 ");

    expect(await guestbook.deleteEntry(entry.id, "1234")).toEqual({ status: "ok" });
  });

  it("이미 삭제된 방명록 글이면 not-found", async () => {
    const entry = await write();
    await guestbook.deleteEntry(entry.id, "1234");

    expect(await guestbook.deleteEntry(entry.id, "1234")).toEqual({ status: "not-found" });
  });

  it("같은 이름이라도 각 방명록 글은 자기 비밀번호로만 삭제된다", async () => {
    const mine = await write("시현", "mine");
    const other = await write("시현", "other");

    expect(await guestbook.deleteEntry(other.id, "mine")).toEqual({ status: "wrong-password" });
    expect(await guestbook.deleteEntry(mine.id, "mine")).toEqual({ status: "ok" });
    expect((await guestbook.listEntries()).map((e) => e.id)).toEqual([other.id]);
  });
});

describe("메시지 수정", () => {
  it("올바른 비밀번호면 메시지만 바뀌고 수정 시각이 기록된다", async () => {
    const entry = await write();

    const result = await guestbook.updateMessage(entry.id, "  고친 메시지 ", "1234");

    expect(result.status).toBe("ok");
    const [after] = await guestbook.listEntries();
    expect(after).toMatchObject({ id: entry.id, name: "시현", message: "고친 메시지", createdAt: entry.createdAt });
    expect(after.updatedAt).toBeInstanceOf(Date);
  });

  it("수정해도 목록 순서는 작성 시각 기준 그대로다", async () => {
    const older = await write("먼저");
    await write("나중");

    await guestbook.updateMessage(older.id, "고침", "1234");

    expect((await guestbook.listEntries()).map((e) => e.name)).toEqual(["나중", "먼저"]);
  });

  it("틀린 비밀번호면 거부되고 메시지는 그대로다", async () => {
    const entry = await write();

    expect(await guestbook.updateMessage(entry.id, "고침", "9999")).toEqual({ status: "wrong-password" });
    expect((await guestbook.listEntries())[0]).toMatchObject({ message: "안녕하세요", updatedAt: null });
  });

  it.each([
    ["빈 메시지", ""],
    ["501자 메시지", "가".repeat(501)],
  ])("%s로는 수정할 수 없다", async (_, message) => {
    const entry = await write();

    const result = await guestbook.updateMessage(entry.id, message, "1234");

    expect(result.status === "invalid" && Object.keys(result.errors)).toEqual(["message"]);
    expect((await guestbook.listEntries())[0].message).toBe("안녕하세요");
  });

  it("이미 삭제된 방명록 글이면 not-found", async () => {
    const entry = await write();
    await guestbook.deleteEntry(entry.id, "1234");

    expect(await guestbook.updateMessage(entry.id, "고침", "1234")).toEqual({ status: "not-found" });
  });

  it("같은 이름이라도 각 방명록 글은 자기 비밀번호로만 수정된다", async () => {
    const mine = await write("시현", "mine");
    const other = await write("시현", "other");

    expect(await guestbook.updateMessage(other.id, "가로채기", "mine")).toEqual({ status: "wrong-password" });
    expect((await guestbook.updateMessage(mine.id, "내 글 수정", "mine")).status).toBe("ok");

    const messages = Object.fromEntries((await guestbook.listEntries()).map((e) => [e.id, e.message]));
    expect(messages).toEqual({ [mine.id]: "내 글 수정", [other.id]: "안녕하세요" });
  });
});

describe("작성 시각이 같을 때", () => {
  it("나중에 남긴 방명록 글(id가 큰 글)이 먼저 온다", async () => {
    const db = new PGlite();
    await db.exec(schema);
    await db.exec(`INSERT INTO entries (name, message, password_hash, created_at) VALUES
      ('먼저', '1', 'x', '2026-09-30T00:00:00Z'), ('나중', '2', 'x', '2026-09-30T00:00:00Z')`);
    const sameTime = createGuestbook(async (text, params) => (await db.query<Record<string, unknown>>(text, params)).rows);

    expect((await sameTime.listEntries()).map((e) => e.name)).toEqual(["나중", "먼저"]);
  });
});
