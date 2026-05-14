import { apiKey } from "@better-auth/api-key"
import { passkey } from "@better-auth/passkey"
import type { AuthServer } from "@better-auth-ui/solid/server"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { magicLink, multiSession, username } from "better-auth/plugins"
import { db } from "./db"
import * as schema from "./schema"

const localDevTrustedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
]

const sendMagicLinkEmail = async ({
  email,
  url
}: {
  email: string
  token: string
  url: string
  metadata?: Record<string, unknown>
}) => {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Magic link email delivery is not configured. Replace sendMagicLinkEmail with a real transactional email provider before enabling magic links in production."
    )
  }

  console.info(`[auth] Magic link for ${email}: ${url}`)
}

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
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string
    }
  },
  plugins: [
    multiSession(),
    passkey(),
    username(),
    apiKey(),
    magicLink({
      sendMagicLink: sendMagicLinkEmail
    })
  ],
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
