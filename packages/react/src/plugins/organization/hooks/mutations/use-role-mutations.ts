import {
  type CreateRoleOptions,
  createRoleOptions,
  type DeleteRoleOptions,
  deleteRoleOptions,
  type OrganizationAuthClient,
  type UpdateRoleOptions,
  updateRoleOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export function useCreateRole<T extends OrganizationAuthClient>(
  authClient: T,
  organizationId: string | undefined,
  options?: CreateRoleOptions<T>,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    {
      ...createRoleOptions(authClient, data?.user.id, organizationId),
      ...options
    },
    queryClient
  )
}

export function useUpdateRole<T extends OrganizationAuthClient>(
  authClient: T,
  organizationId: string | undefined,
  options?: UpdateRoleOptions<T>,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    {
      ...updateRoleOptions(authClient, data?.user.id, organizationId),
      ...options
    },
    queryClient
  )
}

export function useDeleteRole<T extends OrganizationAuthClient>(
  authClient: T,
  organizationId: string | undefined,
  options?: DeleteRoleOptions<T>,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    {
      ...deleteRoleOptions(authClient, data?.user.id, organizationId),
      ...options
    },
    queryClient
  )
}
