import {
  type AddTeamMemberOptions,
  addTeamMemberOptions,
  type CreateTeamOptions,
  createTeamOptions,
  type OrganizationAuthClient,
  type RemoveTeamMemberOptions,
  type RemoveTeamOptions,
  removeTeamMemberOptions,
  removeTeamOptions,
  type UpdateTeamOptions,
  updateTeamOptions
} from "@better-auth-ui/core/plugins/organization"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export function useCreateTeam<T extends OrganizationAuthClient>(
  authClient: T,
  options?: Accessor<CreateTeamOptions<T>>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => ({
      ...createTeamOptions(authClient, session.data?.user.id),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
export function useUpdateTeam<T extends OrganizationAuthClient>(
  authClient: T,
  options?: Accessor<UpdateTeamOptions<T>>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => ({
      ...updateTeamOptions(authClient, session.data?.user.id),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
export function useRemoveTeam<T extends OrganizationAuthClient>(
  authClient: T,
  options?: Accessor<RemoveTeamOptions<T>>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => ({
      ...removeTeamOptions(authClient, session.data?.user.id),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
export function useAddTeamMember<T extends OrganizationAuthClient>(
  authClient: T,
  options?: Accessor<AddTeamMemberOptions<T>>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => ({
      ...addTeamMemberOptions(authClient, session.data?.user.id),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
export function useRemoveTeamMember<T extends OrganizationAuthClient>(
  authClient: T,
  options?: Accessor<RemoveTeamMemberOptions<T>>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => ({
      ...removeTeamMemberOptions(authClient, session.data?.user.id),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
