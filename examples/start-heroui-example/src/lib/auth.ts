import { betterAuth } from "better-auth"
import { multiSession } from "better-auth/plugins"

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true
  },
  plugins: [multiSession()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days cache duration
      strategy: "jwe", // can be "jwt" or "compact"
      refreshCache: true // Enable stateless refresh
    }
  },
  account: {
    storeStateStrategy: "cookie",
    storeAccountCookie: true // Store account data after OAuth flow in a cookie (useful for database-less flows)
  }
})
