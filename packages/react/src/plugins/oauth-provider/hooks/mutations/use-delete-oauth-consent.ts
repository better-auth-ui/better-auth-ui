import {
  type DeleteOAuthConsentOptions,
  deleteOAuthConsentOptions,
  type OAuthProviderAuthClient
} from "@better-auth-ui/core/plugins/oauth-provider"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/**
 * Create a mutation for deleting a stored OAuth consent record.
 *
 * On success, `MutationInvalidator` awaits invalidation of the user's consent
 * list queries.
 */
export function useDeleteOAuthConsent<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  options?: DeleteOAuthConsentOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)

  return useMutation(
    {
      ...deleteOAuthConsentOptions(authClient, session?.user.id),
      ...options
    },
    queryClient
  )
}
