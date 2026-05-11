import { organizationMutationKeys } from "@better-auth-ui/core"
import { type AuthClient, sessionOptions } from "@better-auth-ui/react"
import {
  mutationOptions,
  useMutation,
  useQueryClient
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import type { OrganizationAuthClient } from "../../lib/auth-client"
import { assertAuthClientHasOrganizationOrThrow } from "../../lib/utils"

export type CreateOrganizationOptions = Omit<
  ReturnType<typeof createOrganizationOptions>,
  "mutationKey" | "mutationFn"
>

type CreateOrganizationParams = Parameters<
  OrganizationAuthClient["organization"]["create"]
>[0]

/**
 * Mutation options factory for creating an organization.
 *
 * @param authClient - The Better Auth client.
 */
export function createOrganizationOptions(authClient: OrganizationAuthClient) {
  const mutationKey = organizationMutationKeys.create

  const mutationFn = (params: CreateOrganizationParams) =>
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

/**
 * Create a mutation for creating an organization.
 *
 * Wraps `authClient.organization.create` and invalidates the cached session
 * so that consumers reading the active organization see the freshly created one.
 *
 * @param authClient - The Better Auth client.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useCreateOrganization(
  authClient: AuthClient,
  options?: CreateOrganizationOptions
) {
  assertAuthClientHasOrganizationOrThrow(authClient)

  const queryClient = useQueryClient()

  return useMutation({
    ...createOrganizationOptions(authClient),
    ...options,
    onSuccess: async (data, variables, ...rest) => {
      await queryClient.invalidateQueries({
        queryKey: sessionOptions(authClient).queryKey
      })

      await options?.onSuccess?.(data, variables, ...rest)
    }
  })
}
