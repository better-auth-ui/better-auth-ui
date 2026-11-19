import {
  type ListTeamMembersData,
  type ListTeamMembersParams,
  listTeamMembersOptions,
  type OrganizationTeamsAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type QueryOptions,
  useQuery,
  type UseQueryResult
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"
import { passInitialData } from "../../../../lib/query-initial-data"
import type { InferData } from "@better-auth-ui/core"

export type UseListTeamMembersOptions<T extends OrganizationTeamsAuthClient> =
  Accessor<
    Omit<QueryOptions<ListTeamMembersData<T>>, "queryKey"> &
      ListTeamMembersParams<T>
  >
export function useListTeamMembers<T extends OrganizationTeamsAuthClient>(
  authClient: T,
  options: UseListTeamMembersOptions<T>,
  queryClient?: Accessor<QueryClient>
): UseQueryResult<InferData<T["organization"]["listTeamMembers"]>> {
  const session = useSession(authClient, undefined, queryClient)
  return useQuery(() => {
    const { query, fetchOptions, initialData, ...queryOptions } = options()
    return {
      ...listTeamMembersOptions(authClient, session.data?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions,
      ...passInitialData(initialData)
    }
  }, queryClient)
}
