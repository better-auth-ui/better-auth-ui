import type { MagicLinkAuthClient } from "@better-auth-ui/core/plugins/magic-link"
import { magicLinkMutationKeys } from "@better-auth-ui/core/plugins/magic-link"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

export type SignInMagicLinkParams<TAuthClient extends MagicLinkAuthClient> =
  Parameters<TAuthClient["signIn"]["magicLink"]>[0]

export type SignInMagicLinkOptions<TAuthClient extends MagicLinkAuthClient> =
  Omit<
    ReturnType<typeof signInMagicLinkOptions<TAuthClient>>,
    "mutationKey" | "mutationFn"
  >

/**
 * Mutation options factory for magic-link sign-in.
 *
 * @param authClient - The Better Auth client.
 */
export function signInMagicLinkOptions<TAuthClient extends MagicLinkAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = magicLinkMutationKeys.signIn

  const mutationFn = (params: SignInMagicLinkParams<TAuthClient>) =>
    authClient.signIn.magicLink({
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
 * Create a mutation for requesting a magic-link sign-in email.
 *
 * Wraps `authClient.signIn.magicLink` and forwards React Query mutation
 * options such as `onSuccess`, `onError`, and `retry`.
 *
 * @param authClient - The Better Auth client with the magic-link plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSignInMagicLink<TAuthClient extends MagicLinkAuthClient>(
  authClient: TAuthClient,
  options?: SignInMagicLinkOptions<TAuthClient>
) {
  return useMutation({
    ...signInMagicLinkOptions(authClient),
    ...options
  })
}
