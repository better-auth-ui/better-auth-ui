import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { AdminAuthClient } from "./admin-auth-client"
import { adminMutationKeys } from "./admin-mutation-keys"

export type StopImpersonatingParams<TAuthClient extends AdminAuthClient> =
  Parameters<TAuthClient["admin"]["stopImpersonating"]>[0]

export type StopImpersonatingOptions<TAuthClient extends AdminAuthClient> =
  Omit<
    ReturnType<typeof stopImpersonatingOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/**
 * Mutation options factory for restoring the administrator's session.
 *
 * @param authClient - The Better Auth client with the admin plugin.
 */
export function stopImpersonatingOptions<TAuthClient extends AdminAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = adminMutationKeys.stopImpersonating

  const mutationFn = (params?: StopImpersonatingParams<TAuthClient>) =>
    authClient.admin.stopImpersonating({
      ...(params ?? {}),
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [authQueryKeys.session]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
