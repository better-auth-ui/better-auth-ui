import {
  type OAuthClientManager,
  type OAuthClientOwner,
  oauthClientsOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import { type QueryClient, useQuery } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export function useOAuthClients(
  manager: OAuthClientManager,
  owner: Accessor<OAuthClientOwner>,
  ownerKey: Accessor<string | undefined>,
  queryClient?: Accessor<QueryClient>
) {
  return useQuery(
    () => oauthClientsOptions(manager, owner(), ownerKey()),
    queryClient
  )
}
