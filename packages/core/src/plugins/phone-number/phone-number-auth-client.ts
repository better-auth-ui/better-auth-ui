import type { phoneNumberClient } from "better-auth/client/plugins"
import type { AuthClient } from "../../lib/auth-client"

export type PhoneNumberAuthClient = AuthClient<{
  plugins: [ReturnType<typeof phoneNumberClient>]
}>
