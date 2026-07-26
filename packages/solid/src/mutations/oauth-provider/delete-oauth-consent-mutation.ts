import {
  oauthProviderMutationKeys,
  oauthProviderQueryKeys
} from "@better-auth-ui/core/plugins"

import type { OAuthProviderAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"
import { useSessionScopedMutation } from "../use-session-scoped-mutation"

export type DeleteOAuthConsentParams<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Parameters<TAuthClient["oauth2"]["deleteConsent"]>[0]

export type DeleteOAuthConsentOptions = Parameters<
  typeof useSessionScopedMutation<
    OAuthProviderAuthClient,
    OAuthProviderAuthClient["oauth2"]["deleteConsent"],
    typeof oauthProviderMutationKeys.deleteConsent
  >
>[4]

/**
 * Mutation options factory for deleting a stored OAuth consent record.
 *
 * Deleting a consent means the application has to ask for approval again. It
 * does not revoke access tokens that were already issued.
 */
export function deleteOAuthConsentOptions<
  TAuthClient extends OAuthProviderAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.oauth2.deleteConsent,
    oauthProviderMutationKeys.deleteConsent
  )
}

/**
 * Create a mutation for deleting a stored OAuth consent record.
 *
 * On success, `MutationInvalidator` awaits invalidation of the user's consent
 * list, so a partially failed removal still reflects the server's resulting
 * state.
 */
export function useDeleteOAuthConsent<
  TAuthClient extends OAuthProviderAuthClient
>(authClient: TAuthClient, options?: DeleteOAuthConsentOptions) {
  return useSessionScopedMutation(
    authClient,
    authClient.oauth2.deleteConsent,
    oauthProviderMutationKeys.deleteConsent,
    (userId) => ({ awaits: [oauthProviderQueryKeys.consents(userId)] }),
    options
  )
}
