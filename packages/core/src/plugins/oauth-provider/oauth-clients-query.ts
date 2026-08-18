import { type QueryOptions, skipToken } from "@tanstack/query-core"
import type {
  ManagedOAuthClient,
  OAuthClientManager,
  OAuthClientOwner
} from "./oauth-client-manager"
import { oauthProviderQueryKeys } from "./oauth-provider-query-keys"

export type OAuthClientsOptions = Omit<
  QueryOptions<ManagedOAuthClient[]>,
  "queryKey" | "queryFn"
>

export function oauthClientsOptions(
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string
) {
  return {
    queryKey: oauthProviderQueryKeys.clients(ownerKey),
    queryFn: ownerKey ? ({ signal }) => manager.list(owner, signal) : skipToken
  } satisfies QueryOptions<ManagedOAuthClient[]>
}
