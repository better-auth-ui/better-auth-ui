import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"

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

  return {
    mutationKey,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
