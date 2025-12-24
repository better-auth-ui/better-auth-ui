import { betterAuth } from "better-auth"
import { multiSession } from "better-auth/plugins"

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true
  },
  plugins: [multiSession()]
})
