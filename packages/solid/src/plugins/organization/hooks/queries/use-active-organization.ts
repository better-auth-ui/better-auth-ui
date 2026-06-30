import {
  type ActiveOrganizationData,
  type ActiveOrganizationParams,
  activeOrganizationOptions,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { useOrganizationSlug } from "../../queries/plugin"

export type UseActiveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Accessor<
  Omit<QueryOptions<ActiveOrganizationData<TAuthClient>>, "queryKey"> &
    ActiveOrganizationParams<TAuthClient>
>

export function useActiveOrganization<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UseActiveOrganizationOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  const slug = useOrganizationSlug()

  return useQuery(() => {
    const userId = session.data?.user.id
    const { query, fetchOptions, initialData, ...queryOptions } =
      options?.() ?? {}
    const effectiveQuery =
      slug === null
        ? { organizationSlug: null }
        : slug
          ? { organizationSlug: slug }
          : query

    return {
      ...activeOrganizationOptions(authClient, userId, {
        query: effectiveQuery,
        fetchOptions
      } as ActiveOrganizationParams<TAuthClient>),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
