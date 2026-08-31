import {
  type ListTeamsData,
  type ListTeamsParams,
  listTeamsOptions,
  type OrganizationTeamsAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseListTeamsOptions<T extends OrganizationTeamsAuthClient> =
  Accessor<
    Omit<QueryOptions<ListTeamsData<T>>, "queryKey"> & ListTeamsParams<T>
  >
export function useListTeams<T extends OrganizationTeamsAuthClient>(
  authClient: T,
  options: UseListTeamsOptions<T>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useQuery(() => {
    const { query, fetchOptions, initialData, ...queryOptions } = options()
    return {
      ...listTeamsOptions(authClient, session.data?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions,
      initialData: initialData as undefined
    }
  }, queryClient)
}
