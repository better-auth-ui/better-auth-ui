import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

const sql = neon(process.env.DATABASE_URL || "postgresql://foo@bar")
export const db = drizzle(sql)
