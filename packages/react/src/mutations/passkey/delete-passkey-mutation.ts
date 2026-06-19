import {
  passkeyMutationKeys,
  passkeyQueryKeys
} from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { PasskeyAuthClient } from "../../lib/auth-client"

export type DeletePasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["deletePasskey"]>[0]

export type DeletePasskeyOptions<TAuthClient extends PasskeyAuthClient> = Omit<
  ReturnType<typeof deletePasskeyOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for deleting a passkey.
 *
 * @param authClient - The Better Auth client.
 */
export function deletePasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = passkeyMutationKeys.deletePasskey

  const mutationFn = (params: DeletePasskeyParams<TAuthClient>) =>
    authClient.passkey.deletePasskey({
      ...params,
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
 * Create a mutation for deleting a passkey.
 *
 * On success, `MutationInvalidator` awaits invalidation of the user's
 * passkey list (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useDeletePasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: DeletePasskeyOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...deletePasskeyOptions(authClient),
      ...options,
      meta: {
        awaits: [passkeyQueryKeys.lists(userId)]
      }
    },
    queryClient
  )
}
