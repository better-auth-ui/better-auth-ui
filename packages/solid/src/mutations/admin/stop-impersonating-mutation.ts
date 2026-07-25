import { authQueryKeys } from "@better-auth-ui/core"
import { adminMutationKeys } from "@better-auth-ui/core/plugins"
import type { AdminAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type StopImpersonatingParams<TAuthClient extends AdminAuthClient> =
  Parameters<TAuthClient["admin"]["stopImpersonating"]>[0]

/**
 * Create Solid Query mutation options that restore the administrator's
 * session and refresh the cached session after success.
 */
export function stopImpersonatingOptions<TAuthClient extends AdminAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.admin.stopImpersonating,
    adminMutationKeys.stopImpersonating,
    { awaits: [authQueryKeys.session] }
  )
}
