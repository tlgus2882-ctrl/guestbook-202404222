import "server-only";
import { neon } from "@neondatabase/serverless";
import { createGuestbook } from "./guestbook";

const sql = neon(process.env.DATABASE_URL!);

export const guestbook = createGuestbook((text, params) => sql.query(text, params));
