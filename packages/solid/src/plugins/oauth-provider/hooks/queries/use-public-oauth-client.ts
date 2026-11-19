import {
  type OAuthProviderAuthClient,
  type PublicOAuthClientData,
  type PublicOAuthClientParams,
  publicOAuthClientOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import {
  type QueryClient,
  type QueryOptions,
  useQuery,
  type UseQueryResult
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { passInitialData } from "../../../../lib/query-initial-data"
import type { InferData } from "@better-auth-ui/core"

export type UsePublicOAuthClientOptions<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Accessor<
  Omit<QueryOptions<PublicOAuthClientData<TAuthClient>>, "queryKey"> &
    PublicOAuthClientParams<TAuthClient>
>

export function usePublicOAuthClient<
  TAuthClient extends OAuthProviderAuthClient
>(
  authClient: TAuthClient,
  clientId: Accessor<string | undefined>,
  options?: UsePublicOAuthClientOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
): UseQueryResult<InferData<TAuthClient["oauth2"]["publicClient"]>> {
  return useQuery(() => {
    const { fetchOptions, oauthQuery, initialData, ...queryOptions } =
      options?.() ?? {}

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- rebuilds the generic params from their own fields
    const params = {
      fetchOptions,
      oauthQuery
    } as PublicOAuthClientParams<TAuthClient>

    return {
      ...publicOAuthClientOptions(authClient, clientId(), params),
      ...queryOptions,
      ...passInitialData(initialData)
    }
  }, queryClient)
}
