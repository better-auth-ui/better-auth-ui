import {
  oauthProviderMutationKeys,
  oauthProviderQueryKeys
} from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"

import type { OAuthProviderAuthClient } from "../../lib/auth-client"
import { useSession } from "../../queries/auth/session-query"

export type DeleteOAuthConsentParams<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Parameters<TAuthClient["oauth2"]["deleteConsent"]>[0]

export type DeleteOAuthConsentOptions<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Omit<
  ReturnType<typeof deleteOAuthConsentOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for deleting a stored OAuth consent record.
 *
 * Deleting a consent means the application has to ask for approval again. It
 * does not revoke access tokens that were already issued.
 *
 * @param authClient - The Better Auth client with the OAuth provider plugin.
 */
export function deleteOAuthConsentOptions<
  TAuthClient extends OAuthProviderAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (params: DeleteOAuthConsentParams<TAuthClient>) =>
    authClient.oauth2.deleteConsent({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({
    mutationKey: oauthProviderMutationKeys.deleteConsent,
    mutationFn
  })
}

/**
 * Create a mutation for deleting a stored OAuth consent record.
 *
 * On success, `MutationInvalidator` awaits invalidation of the user's consent
 * list (see `meta.awaits`), so a partially failed removal still reflects the
 * server's resulting state.
 *
 * @param authClient - The Better Auth client with the OAuth provider plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useDeleteOAuthConsent<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  options?: DeleteOAuthConsentOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...deleteOAuthConsentOptions(authClient),
      ...options,
      meta: {
        awaits: [oauthProviderQueryKeys.consents(userId)]
      }
    },
    queryClient
  )
}
