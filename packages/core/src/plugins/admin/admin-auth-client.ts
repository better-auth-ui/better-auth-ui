import type {
  AdminClientOptions,
  adminClient
} from "better-auth/client/plugins"
import type { AuthClient } from "../../lib/auth-client"

export type AdminAuthClient = AuthClient<{
  plugins: [ReturnType<typeof adminClient<AdminClientOptions>>]
}>
