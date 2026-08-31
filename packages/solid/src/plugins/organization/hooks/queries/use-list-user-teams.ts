import {
  type ListUserTeamsData,
  type ListUserTeamsParams,
  listUserTeamsOptions,
  type OrganizationTeamsAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListUserTeamsOptions<T extends OrganizationTeamsAuthClient> =
  Accessor<
    Omit<QueryOptions<ListUserTeamsData<T>>, "queryKey"> &
      ListUserTeamsParams<T>
  >

export function useListUserTeams<T extends OrganizationTeamsAuthClient>(
  authClient: T,
  options: UseListUserTeamsOptions<T>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useQuery(() => {
    const { query, fetchOptions, initialData, ...queryOptions } = options()
    return {
      ...listUserTeamsOptions(authClient, session.data?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
