import { betterAuth } from "better-auth"

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true
  },
  secret: process.env.BETTER_AUTH_SECRET ?? "solid-start-dev-secret"
})
