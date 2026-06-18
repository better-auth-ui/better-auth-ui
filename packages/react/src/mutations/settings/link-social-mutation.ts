import { authMutationKeys } from "@better-auth-ui/core"
import { mutationOptions, useMutation } from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"

import type { AuthClient } from "../../lib/auth-client"

export type LinkSocialParams<TAuthClient extends AuthClient> = Parameters<
  TAuthClient["linkSocial"]
>[0]

export type LinkSocialOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof linkSocialOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for linking a social provider to the current user.
 *
 * @param authClient - The Better Auth client.
 */
export function linkSocialOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.linkSocial

  const mutationFn = (params: LinkSocialParams<TAuthClient>) =>
    authClient.linkSocial({
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
 * Create a mutation for linking a social provider to the current user.
 *
 * Wraps `authClient.linkSocial` to initiate a provider redirect and forwards
 * React Query mutation options such as `onSuccess`, `onError`, and `retry`.
 *
 * @param authClient - The Better Auth client.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useLinkSocial<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: LinkSocialOptions<TAuthClient>
) {
  return useMutation({
    ...linkSocialOptions(authClient),
    ...options
  })
}
