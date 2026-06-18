import { authMutationKeys } from "@better-auth-ui/core"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"

import type { AuthClient } from "../../lib/auth-client"

export type SignInSocialParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["signIn"]["social"]
>[0]

export type SignInSocialOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof signInSocialOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for social sign-in.
 *
 * The returned `mutationKey` (`["auth", "signIn", "social"]`) is stable and
 * can be passed to `useIsMutating` or matched inside a global
 * `MutationCache` observer for toast handling.
 *
 * @param authClient - The Better Auth client.
 */
export function signInSocialOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.signIn.social

  const mutationFn = (params: SignInSocialParams<TAuthClient>) =>
    authClient.signIn.social({
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
 * Create a mutation for social sign-in.
 *
 * Wraps `authClient.signIn.social` to initiate a provider redirect and
 * forwards React Query mutation options such as `onSuccess`, `onError`,
 * and `retry`.
 *
 * @param authClient - The Better Auth client.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSignInSocial<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignInSocialOptions<TAuthClient>
) {
  return useMutation({
    ...signInSocialOptions(authClient),
    ...options
  })
}
