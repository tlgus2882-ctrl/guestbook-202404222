// db/schema.sql을 DATABASE_URL의 DB에 적용한다. 여러 번 실행해도 안전하다.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL이 설정되지 않았습니다.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

await sql.query(schema);
console.log("entries 테이블 준비 완료");
