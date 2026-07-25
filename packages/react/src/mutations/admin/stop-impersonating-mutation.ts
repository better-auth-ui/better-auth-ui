import { authQueryKeys } from "@better-auth-ui/core"
import { adminMutationKeys } from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { AdminAuthClient } from "../../lib/auth-client"

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

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({
    mutationKey,
    mutationFn
  })
}

/**
 * Stop impersonating a user and restore the administrator's session.
 *
 * On success, `MutationInvalidator` awaits invalidation of the session query
 * so every auth surface immediately reflects the restored administrator.
 *
 * @param authClient - The Better Auth client with the admin plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useStopImpersonating<TAuthClient extends AdminAuthClient>(
  authClient: TAuthClient,
  options?: StopImpersonatingOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...stopImpersonatingOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
