import { authQueryKeys } from "@better-auth-ui/core"
import { passkeyMutationKeys } from "@better-auth-ui/core/plugins/passkey"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { PasskeyAuthClient } from "../../lib/auth-client"

export type SignInPasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["signIn"]["passkey"]>[0]

export type SignInPasskeyOptions<TAuthClient extends PasskeyAuthClient> = Omit<
  ReturnType<typeof signInPasskeyOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for passkey sign-in.
 *
 * @param authClient - The Better Auth client with the passkey plugin.
 */
export function signInPasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = passkeyMutationKeys.signIn

  // biome-ignore lint/suspicious/noConfusingVoidType: void allows no-arg mutate
  const mutationFn = (params?: SignInPasskeyParams<TAuthClient> | void) =>
    authClient.signIn.passkey({
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
 * Create a mutation for passkey sign-in.
 *
 * On success, `MutationInvalidator` awaits invalidation of the session
 * query so the new session is refetched (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client with the passkey plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSignInPasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: SignInPasskeyOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...signInPasskeyOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}
