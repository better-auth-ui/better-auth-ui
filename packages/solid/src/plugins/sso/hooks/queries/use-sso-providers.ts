import {
  type SsoAuthClient,
  type SsoProviderResponse,
  type SsoProvidersResponse,
  ssoProviderOptions,
  ssoProvidersOptions
} from "@better-auth-ui/core/plugins/sso"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseSsoProvidersOptions = Accessor<
  Omit<QueryOptions<SsoProvidersResponse>, "queryKey">
>

export function useSsoProviders(
  authClient: SsoAuthClient,
  options?: UseSsoProvidersOptions,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useQuery(() => {
    const { initialData, ...queryOptions } = options?.() ?? {}
    return {
      ...ssoProvidersOptions(authClient, session.data?.user.id),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}

export type UseSsoProviderOptions = Accessor<
  Omit<QueryOptions<SsoProviderResponse>, "queryKey">
>

export function useSsoProvider(
  authClient: SsoAuthClient,
  providerId: Accessor<string | undefined>,
  options?: UseSsoProviderOptions,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useQuery(() => {
    const { initialData, ...queryOptions } = options?.() ?? {}
    return {
      ...ssoProviderOptions(authClient, session.data?.user.id, providerId()),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
