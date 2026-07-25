import {
  type OAuthProviderAuthClient,
  type PublicOAuthClientData,
  type PublicOAuthClientParams,
  publicOAuthClientOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

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
) {
  return useQuery(() => {
    const { fetchOptions, initialData, ...queryOptions } = options?.() ?? {}

    return {
      ...publicOAuthClientOptions(authClient, clientId(), {
        fetchOptions
      } as PublicOAuthClientParams<TAuthClient>),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
