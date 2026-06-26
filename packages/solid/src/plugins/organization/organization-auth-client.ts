import type { organizationClient } from "better-auth/client/plugins"
import type { createAuthClient } from "better-auth/solid"

export type OrganizationAuthClient = ReturnType<
  typeof createAuthClient<{
    plugins: [ReturnType<typeof organizationClient<object>>]
  }>
>
