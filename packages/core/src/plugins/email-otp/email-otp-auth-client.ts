import type { emailOTPClient } from "better-auth/client/plugins"
import type { AuthClient } from "../../lib/auth-client"

export type EmailOtpAuthClient = AuthClient<{
  plugins: [ReturnType<typeof emailOTPClient>]
}>
