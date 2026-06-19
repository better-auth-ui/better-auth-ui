import {
  organizationMutationKeys,
  organizationQueryKeys
} from "@better-auth-ui/core/plugins"
import {
  mutationOptions,
  type QueryClient,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useSession } from "../../hooks/queries/use-session"
import type { OrganizationAuthClient } from "../../lib/auth-client"

export type LeaveOrganizationParams<
  TAuthClient extends OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["leave"]>[0]

export type LeaveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<
  ReturnType<typeof leaveOrganizationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function leaveOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  const mutationKey = organizationMutationKeys.leave

  const mutationFn = (params: LeaveOrganizationParams<TAuthClient>) =>
    authClient.organization.leave({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >({
    mutationKey,
    mutationFn
  })
}

export function useLeaveOrganization<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: LeaveOrganizationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...leaveOrganizationOptions(authClient),
      ...options,
      meta: {
        awaits: [
          organizationQueryKeys.members.all(userId),
          organizationQueryKeys.fullDetails(userId)
        ],
        invalidates: [
          organizationQueryKeys.lists(userId),
          organizationQueryKeys.activeOrganizations(userId)
        ]
      }
    },
    queryClient
  )
}
