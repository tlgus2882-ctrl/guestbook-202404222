// 방명록 도메인 규칙(검증, 비밀번호 확인, 저장)을 모두 담는 모듈.
// SQL 실행기를 주입받으므로 운영(Neon)과 테스트(PGlite)가 같은 코드를 쓴다.
import { hashPassword, verifyPassword } from "./password";
import { checkFields, hasErrors, type FieldErrors } from "./validation";

const ENTRY_COLUMNS = "id, name, message, created_at, updated_at";

export type Query = (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

export type Entry = {
  id: number;
  name: string;
  message: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type NewEntry = { name: string; message: string; password: string };

export type CreateResult = { status: "ok"; entry: Entry } | { status: "invalid"; errors: FieldErrors };

export type UpdateResult =
  | { status: "ok"; entry: Entry }
  | { status: "invalid"; errors: FieldErrors }
  | { status: "wrong-password" }
  | { status: "not-found" };

export type DeleteResult = { status: "ok" } | { status: "wrong-password" } | { status: "not-found" };

export type Guestbook = ReturnType<typeof createGuestbook>;

function toEntry(row: Record<string, unknown>): Entry {
  return {
    id: row.id as number,
    name: row.name as string,
    message: row.message as string,
    createdAt: new Date(row.created_at as string | Date),
    updatedAt: row.updated_at == null ? null : new Date(row.updated_at as string | Date),
  };
}

export function createGuestbook(query: Query) {
  // 거부 사유를 찾는다: 방명록 글이 없으면 not-found, 비밀번호가 틀리면 wrong-password, 통과하면 null.
  async function findDenial(id: number, password: string) {
    const [row] = await query("SELECT password_hash FROM entries WHERE id = $1", [id]);
    if (!row) return { status: "not-found" } as const;
    if (!(await verifyPassword(password.trim(), row.password_hash as string))) return { status: "wrong-password" } as const;
    return null;
  }

  return {
    async listEntries(): Promise<Entry[]> {
      const rows = await query(`SELECT ${ENTRY_COLUMNS} FROM entries ORDER BY created_at DESC, id DESC`);
      return rows.map(toEntry);
    },

    async createEntry(input: NewEntry): Promise<CreateResult> {
      const errors = checkFields(input);
      if (hasErrors(errors)) return { status: "invalid", errors };

      const passwordHash = await hashPassword(input.password.trim());
      const [row] = await query(
        `INSERT INTO entries (name, message, password_hash) VALUES ($1, $2, $3) RETURNING ${ENTRY_COLUMNS}`,
        [input.name.trim(), input.message.trim(), passwordHash],
      );
      return { status: "ok", entry: toEntry(row) };
    },

    async updateMessage(id: number, message: string, password: string): Promise<UpdateResult> {
      const errors = checkFields({ message });
      if (hasErrors(errors)) return { status: "invalid", errors };

      const denial = await findDenial(id, password);
      if (denial) return denial;

      const [row] = await query(
        `UPDATE entries SET message = $2, updated_at = now() WHERE id = $1 RETURNING ${ENTRY_COLUMNS}`,
        [id, message.trim()],
      );
      return row ? { status: "ok", entry: toEntry(row) } : { status: "not-found" };
    },

    async deleteEntry(id: number, password: string): Promise<DeleteResult> {
      const denial = await findDenial(id, password);
      if (denial) return denial;

      const deleted = await query("DELETE FROM entries WHERE id = $1 RETURNING id", [id]);
      return deleted.length > 0 ? { status: "ok" } : { status: "not-found" };
    },
  };
}
