import {
  type AdminAuthClient,
  banAdminUserOptions,
  createAdminUserOptions,
  impersonateAdminUserOptions,
  removeAdminUserOptions,
  revokeAdminUserSessionOptions,
  revokeAdminUserSessionsOptions,
  setAdminUserPasswordOptions,
  setAdminUserRoleOptions,
  unbanAdminUserOptions,
  updateAdminUserOptions
} from "@better-auth-ui/core/plugins/admin"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

export function useCreateAdminUser(
  authClient: AdminAuthClient,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    createAdminUserOptions(authClient, data?.user.id),
    queryClient
  )
}

export function useUpdateAdminUser(
  authClient: AdminAuthClient,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    updateAdminUserOptions(authClient, data?.user.id),
    queryClient
  )
}

export function useSetAdminUserRole(
  authClient: AdminAuthClient,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    setAdminUserRoleOptions(authClient, data?.user.id),
    queryClient
  )
}

export function useSetAdminUserPassword(
  authClient: AdminAuthClient,
  queryClient?: QueryClient
) {
  const mutation = useMutation(
    setAdminUserPasswordOptions(authClient, () => {
      setTimeout(() => mutation.reset(), 0)
    }),
    queryClient
  )

  return mutation
}

export function useBanAdminUser(
  authClient: AdminAuthClient,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    banAdminUserOptions(authClient, data?.user.id),
    queryClient
  )
}

export function useUnbanAdminUser(
  authClient: AdminAuthClient,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    unbanAdminUserOptions(authClient, data?.user.id),
    queryClient
  )
}

export function useRevokeAdminUserSession(
  authClient: AdminAuthClient,
  targetUserId?: string,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    revokeAdminUserSessionOptions(authClient, data?.user.id, targetUserId),
    queryClient
  )
}

export function useRevokeAdminUserSessions(
  authClient: AdminAuthClient,
  targetUserId?: string,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    revokeAdminUserSessionsOptions(authClient, data?.user.id, targetUserId),
    queryClient
  )
}

export function useImpersonateAdminUser(
  authClient: AdminAuthClient,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    impersonateAdminUserOptions(authClient, data?.user.id),
    queryClient
  )
}

export function useRemoveAdminUser(
  authClient: AdminAuthClient,
  queryClient?: QueryClient
) {
  const { data } = useSession(authClient, undefined, queryClient)
  return useMutation(
    removeAdminUserOptions(authClient, data?.user.id),
    queryClient
  )
}
