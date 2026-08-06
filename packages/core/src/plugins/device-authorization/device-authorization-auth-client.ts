import type { deviceAuthorizationClient } from "better-auth/client/plugins"
import type { AuthClient } from "../../lib/auth-client"

export type DeviceAuthorizationAuthClient = AuthClient<{
  plugins: [ReturnType<typeof deviceAuthorizationClient>]
}>
