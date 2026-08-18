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
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export function useCreateTeam<T extends OrganizationAuthClient>(
  authClient: T,
  options?: CreateTeamOptions<T>,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    { ...createTeamOptions(authClient, data?.user.id), ...options },
    queryClient
  )
}
export function useUpdateTeam<T extends OrganizationAuthClient>(
  authClient: T,
  options?: UpdateTeamOptions<T>,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    { ...updateTeamOptions(authClient, data?.user.id), ...options },
    queryClient
  )
}
export function useRemoveTeam<T extends OrganizationAuthClient>(
  authClient: T,
  options?: RemoveTeamOptions<T>,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    { ...removeTeamOptions(authClient, data?.user.id), ...options },
    queryClient
  )
}
export function useAddTeamMember<T extends OrganizationAuthClient>(
  authClient: T,
  options?: AddTeamMemberOptions<T>,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    { ...addTeamMemberOptions(authClient, data?.user.id), ...options },
    queryClient
  )
}
export function useRemoveTeamMember<T extends OrganizationAuthClient>(
  authClient: T,
  options?: RemoveTeamMemberOptions<T>,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    { ...removeTeamMemberOptions(authClient, data?.user.id), ...options },
    queryClient
  )
}
