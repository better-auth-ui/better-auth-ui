import {
  listOrganizationMembersOptions,
  type ListOrganizationMembersData,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useSession } from "@better-auth-ui/react"
import { useQuery, skipToken } from "@tanstack/react-query"

/** Load every page so local filters and owner safeguards include every member. */
export function useAllOrganizationMembers(
  organizationId?: string,
  { enabled = true, role }: { enabled?: boolean; role?: string } = {}
) {
  const { authClient } = useAuth()
  const { data: session } = useSession(authClient)
  const client = authClient as OrganizationAuthClient
  const query = {
    organizationId,
    limit: 100,
    offset: 0,
    ...(role
      ? {
          filterField: "role",
          filterValue: role,
          filterOperator: "contains" as const
        }
      : {})
  }
  const options = listOrganizationMembersOptions(client, session?.user.id, {
    query
  })
  return useQuery({
    ...options,
    enabled,
    queryKey: [...options.queryKey, "native-all"],
    queryFn:
      session?.user.id && organizationId
        ? async ({ signal }) => {
            const members: NonNullable<ListOrganizationMembersData>["members"] =
              []
            let total = 0
            do {
              const page = await client.organization.listMembers({
                query: { ...query, offset: members.length },
                fetchOptions: { throw: true, signal }
              })
              total = page.total
              if (!page.members.length) break
              members.push(...page.members)
            } while (members.length < total)
            return { members, total }
          }
        : skipToken
  })
}
