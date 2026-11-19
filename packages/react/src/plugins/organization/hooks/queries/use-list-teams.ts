import {
  type ListTeamsData,
  type ListTeamsParams,
  listTeamsOptions,
  type OrganizationTeamsAuthClient
} from "@better-auth-ui/core/plugins/organization"
import {
  type QueryClient,
  type UseQueryOptions,
  type UseQueryResult,
  useQuery
} from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"
import type { InferData } from "@better-auth-ui/core"

export type UseListTeamsOptions<T extends OrganizationTeamsAuthClient> = Omit<
  UseQueryOptions<ListTeamsData<T>>,
  "queryKey"
> &
  ListTeamsParams<T>
export function useListTeams<T extends OrganizationTeamsAuthClient>(
  authClient: T,
  options: UseListTeamsOptions<T>,
  queryClient?: QueryClient
): UseQueryResult<NoInfer<InferData<T["organization"]["listTeams"]>>> {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const { query, fetchOptions, ...queryOptions } = options
  return useQuery(
    {
      ...listTeamsOptions(authClient, session?.user.id, {
        query,
        fetchOptions
      }),
      ...queryOptions
    },
    queryClient
  )
}
