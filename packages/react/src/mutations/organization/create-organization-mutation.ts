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

export type CreateOrganizationParams<
  TAuthClient extends OrganizationAuthClient
> = Parameters<TAuthClient["organization"]["create"]>[0]

export type CreateOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
> = Omit<
  ReturnType<typeof createOrganizationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function createOrganizationOptions<
  TAuthClient extends OrganizationAuthClient
>(authClient: TAuthClient) {
  const mutationKey = organizationMutationKeys.create

  const mutationFn = (params: CreateOrganizationParams<TAuthClient>) =>
    authClient.organization.create({
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

export function useCreateOrganization<
  TAuthClient extends OrganizationAuthClient
>(
  authClient: TAuthClient,
  options?: CreateOrganizationOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  const userId = session?.user.id

  return useMutation(
    {
      ...createOrganizationOptions(authClient),
      ...options,
      meta: {
        awaits: [organizationQueryKeys.lists(userId)],
        invalidates: [
          organizationQueryKeys.fullDetails(userId),
          organizationQueryKeys.activeOrganizations(userId)
        ]
      }
    },
    queryClient
  )
}
