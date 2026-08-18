import {
  type OAuthClientManager,
  type OAuthClientOwner,
  oauthClientsOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import { type QueryClient, useQuery } from "@tanstack/react-query"

/** Subscribe to OAuth clients for one explicitly partitioned owner. */
export function useOAuthClients(
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string,
  queryClient?: QueryClient
) {
  return useQuery(oauthClientsOptions(manager, owner, ownerKey), queryClient)
}
