import { apiKey } from "@better-auth/api-key"
import { passkey } from "@better-auth/passkey"
import type { AuthServer } from "@better-auth-ui/solid/server"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { multiSession, username } from "better-auth/plugins"
import { db } from "./db"
import * as schema from "./schema"

const localDevTrustedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
]

const authOptions = {
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
    usePlural: true
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [multiSession(), passkey(), username(), apiKey()],
  secret: process.env.BETTER_AUTH_SECRET as string,
  session: {
    cookieCache: {
      enabled: false,
      maxAge: 5 * 60
    }
  },
  trustedOrigins:
    process.env.NODE_ENV === "production" ? [] : localDevTrustedOrigins,
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true
    },
    deleteUser: {
      enabled: true
    }
  }
}

const authInstance = betterAuth(authOptions)

export const auth: AuthServer = authInstance

export const authHandler = (request: Request) => authInstance.handler(request)
