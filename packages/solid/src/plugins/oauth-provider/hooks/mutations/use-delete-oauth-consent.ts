import {
  type DeleteOAuthConsentOptions,
  deleteOAuthConsentOptions,
  type OAuthProviderAuthClient
} from "@better-auth-ui/core/plugins/oauth-provider"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseDeleteOAuthConsentOptions<
  TAuthClient extends OAuthProviderAuthClient
> = Accessor<DeleteOAuthConsentOptions<TAuthClient>>

export function useDeleteOAuthConsent<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  options?: UseDeleteOAuthConsentOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(
    () => ({
      ...deleteOAuthConsentOptions(authClient, session.data?.user.id),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
