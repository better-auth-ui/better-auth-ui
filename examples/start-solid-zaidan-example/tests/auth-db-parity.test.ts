import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const exampleRoot = resolve(__dirname, "..")
const shadcnRoot = resolve(__dirname, "../../start-shadcn-example")

const readExampleFile = (path: string) =>
  readFileSync(resolve(exampleRoot, path), "utf8")

const readShadcnFile = (path: string) =>
  readFileSync(resolve(shadcnRoot, path), "utf8")

const readJson = <T>(path: string) =>
  JSON.parse(readFileSync(resolve(exampleRoot, path), "utf8")) as T

describe("Solid auth database parity", () => {
  it("uses the same local Better Auth database adapter shape as the shadcn example", () => {
    const solidAuth = readExampleFile("src/lib/auth.ts")
    const shadcnAuth = readShadcnFile("src/lib/auth.ts")

    expect(solidAuth).toContain('from "better-auth/adapters/drizzle"')
    expect(solidAuth).toContain('from "./db"')
    expect(solidAuth).toContain('from "./schema"')
    expect(solidAuth).toContain("drizzleAdapter(db")
    expect(solidAuth).toContain('provider: "pg"')
    expect(solidAuth).toContain("schema: schema")
    expect(solidAuth).toContain("usePlural: true")
    expect(solidAuth).toContain("process.env.BETTER_AUTH_SECRET as string")
    expect(solidAuth).toContain("process.env.BETTER_AUTH_URL")
    expect(solidAuth).toContain("multiSession()")
    expect(solidAuth).toContain("passkey()")
    expect(solidAuth).toContain("username()")
    expect(solidAuth).toContain("apiKey()")

    expect(shadcnAuth).toContain("drizzleAdapter(db")
    expect(shadcnAuth).toContain('provider: "pg"')
    expect(shadcnAuth).toContain("usePlural: true")
  })

  it("trusts canonical Better Auth URL plus known Solid dev origins without production wildcards", () => {
    const solidAuth = readExampleFile("src/lib/auth.ts")

    expect(solidAuth).toContain("trustedOrigins:")
    expect(solidAuth).toContain("localDevTrustedOrigins")
    expect(solidAuth).toContain('"http://localhost:5173"')
    expect(solidAuth).toContain('"http://localhost:5174"')
    expect(solidAuth).toContain('"http://127.0.0.1:5173"')
    expect(solidAuth).toContain('"http://127.0.0.1:5174"')
    expect(solidAuth).toContain('process.env.NODE_ENV === "production" ? []')
    expect(solidAuth).not.toContain('"*"')
  })

  it("enables Better Auth changeEmail on the server so the settings form can submit", () => {
    const solidAuth = readExampleFile("src/lib/auth.ts")

    expect(solidAuth).toContain("changeEmail:")
    expect(solidAuth).toContain("enabled: true")
    expect(solidAuth).toContain("updateEmailWithoutVerification: true")
    expect(solidAuth).not.toContain("change email disabled")
    expect(solidAuth).not.toContain("Verification email isn't enabled")
  })

  it("declares the same Neon/Drizzle environment contract for local DATABASE_URL", () => {
    const db = readExampleFile("src/lib/db.ts")
    const schema = readExampleFile("src/lib/schema.ts")
    const drizzleConfig = readExampleFile("drizzle.config.ts")
    const packageJson = readJson<{
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
    }>("package.json")

    expect(db).toContain('from "@neondatabase/serverless"')
    expect(db).toContain('from "drizzle-orm/neon-http"')
    expect(db).toContain("neon(process.env.DATABASE_URL as string)")
    expect(schema).toBe(readShadcnFile("src/lib/schema.ts"))
    expect(existsSync(resolve(exampleRoot, "auth-schema.ts"))).toBe(true)
    expect(drizzleConfig).toContain('schema: "./src/lib/schema.ts"')
    expect(drizzleConfig).toContain('out: "./drizzle"')
    expect(drizzleConfig).toContain('dialect: "postgresql"')
    expect(drizzleConfig).toContain("process.env.DATABASE_URL as string")
    expect(packageJson.dependencies).toMatchObject({
      "@better-auth/api-key": expect.any(String),
      "@better-auth/passkey": expect.any(String),
      "@neondatabase/serverless": expect.any(String),
      "drizzle-orm": expect.any(String)
    })
    expect(packageJson.devDependencies).toMatchObject({
      "drizzle-kit": expect.any(String)
    })
  })
})
