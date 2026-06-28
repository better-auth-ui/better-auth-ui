import type { Auth } from "better-auth"
import type { organization } from "better-auth/plugins"

export type OrganizationAuthServer = Pick<
  Auth<{ plugins: [ReturnType<typeof organization>] }>,
  "api"
>
