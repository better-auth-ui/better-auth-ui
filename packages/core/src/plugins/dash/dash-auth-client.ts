import type { dashClient } from "@better-auth/infra/client"
import type { AuthClient } from "../../lib/auth-client"

/** Better Auth client with the Infrastructure Dash client plugin enabled. */
export type DashAuthClient = AuthClient<{
  plugins: [ReturnType<typeof dashClient>]
}>
