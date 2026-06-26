import type { organizationClient } from "better-auth/client/plugins"
import type { createAuthClient } from "better-auth/react"

export type OrganizationAuthClient = ReturnType<
  typeof createAuthClient<{
    plugins: [ReturnType<typeof organizationClient<object>>]
  }>
>
