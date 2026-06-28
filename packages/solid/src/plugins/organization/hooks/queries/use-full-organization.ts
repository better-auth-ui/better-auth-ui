import {
  type FullOrganizationData,
  type FullOrganizationParams,
  fullOrganizationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseFullOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<FullOrganizationData<TAuthClient>>, "queryKey"> &
    FullOrganizationParams<TAuthClient>
>

export function useFullOrganization<TAuthClient extends OrganizationAuthClient>(
  authClient: TAuthClient,
  options?: UseFullOrganizationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const userId = session.data?.user.id
    const {
      query,
      fetchOptions,
      initialData,
      enabled = true,
      ...queryOptions
    } = options?.() ?? {}
    const baseOptions = fullOrganizationOptions(authClient, userId, {
      query,
      fetchOptions
    })

    return {
      ...baseOptions,
      queryFn: baseOptions.queryFn,
      ...queryOptions,
      enabled: Boolean(userId) && enabled,
      initialData: initialData as undefined
    }
  }, queryClient)
}
