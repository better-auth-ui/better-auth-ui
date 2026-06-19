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
import { useActiveOrganization } from "../../queries/organization"

export type UpdateOrganizationParams<
  TAuthClient extends OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["update"]>[0]

export type UpdateOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<
  ReturnType<typeof updateOrganizationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function updateOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  const mutationKey = organizationMutationKeys.update

  const mutationFn = (params: UpdateOrganizationParams<TAuthClient>) =>
    authClient.organization.update({
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

export function useUpdateOrganization<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: UpdateOrganizationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  const { data: activeOrganization } = useActiveOrganization(
    authClient,
    undefined,
    queryClient
  )

  return useMutation(
    {
      ...updateOrganizationOptions(authClient),
      ...options,
      mutationFn: (params: UpdateOrganizationParams<TAuthClient>) =>
        authClient.organization.update({
          ...params,
          organizationId: params?.organizationId ?? activeOrganization?.id,
          fetchOptions: { ...params?.fetchOptions, throw: true }
        }),
      meta: {
        awaits: [
          organizationQueryKeys.lists(userId),
          organizationQueryKeys.fullDetails(userId),
          organizationQueryKeys.activeOrganizations(userId)
        ]
      }
    },
    queryClient
  )
}
