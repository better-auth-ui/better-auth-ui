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

export type AddPasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["addPasskey"]>[0]

export type AddPasskeyOptions<TAuthClient extends PasskeyAuthClient> = Omit<
  ReturnType<typeof addPasskeyOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for registering a new passkey.
 *
 * @param authClient - The Better Auth client with the passkey plugin.
 */
export function addPasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = passkeyMutationKeys.addPasskey

  // biome-ignore lint/suspicious/noConfusingVoidType: void allows no-arg mutate
  const mutationFn = (params?: AddPasskeyParams<TAuthClient> | void) =>
    authClient.passkey.addPasskey({
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
 * Create a mutation for registering a new passkey.
 *
 * On success, `MutationInvalidator` awaits invalidation of the user's
 * passkey list (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useAddPasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: AddPasskeyOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...addPasskeyOptions(authClient),
      ...options,
      meta: {
        awaits: [passkeyQueryKeys.lists(userId)]
      }
    },
    queryClient
  )
}
