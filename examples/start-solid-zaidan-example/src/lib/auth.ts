import { betterAuth } from "better-auth"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:5173",
  emailAndPassword: {
    enabled: true
  },
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "solid-start-dev-secret-for-local-development-only"
})
