import type { createAuthClient } from "better-auth/client"
import type { organizationClient } from "better-auth/client/plugins"
import type { OmitUseKeys } from "../../lib/auth-client"

export type OrganizationAuthClient = OmitUseKeys<
  ReturnType<
    typeof createAuthClient<{
      plugins: [ReturnType<typeof organizationClient<object>>]
    }>
  >
>
