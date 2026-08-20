import {
  type CreateRoleOptions,
  createRoleOptions,
  type DeleteRoleOptions,
  deleteRoleOptions,
  type OrganizationAuthClient,
  type UpdateRoleOptions,
  updateRoleOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export function useCreateRole<T extends OrganizationAuthClient>(
  authClient: T,
  organizationId: Accessor<string | undefined>,
  options?: Accessor<CreateRoleOptions<T>>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => ({
      ...createRoleOptions(authClient, session.data?.user.id, organizationId()),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}

export function useUpdateRole<T extends OrganizationAuthClient>(
  authClient: T,
  organizationId: Accessor<string | undefined>,
  options?: Accessor<UpdateRoleOptions<T>>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => ({
      ...updateRoleOptions(authClient, session.data?.user.id, organizationId()),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}

export function useDeleteRole<T extends OrganizationAuthClient>(
  authClient: T,
  organizationId: Accessor<string | undefined>,
  options?: Accessor<DeleteRoleOptions<T>>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => ({
      ...deleteRoleOptions(authClient, session.data?.user.id, organizationId()),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
