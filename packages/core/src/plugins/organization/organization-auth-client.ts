import type { organizationClient } from "better-auth/client/plugins"
import type { AuthClient } from "../../lib/auth-client"

export type OrganizationAuthClient = AuthClient<{
  plugins: [ReturnType<typeof organizationClient<object>>]
}>
