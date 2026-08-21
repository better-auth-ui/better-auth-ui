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
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export function useCreateAdminUser(
  authClient: AdminAuthClient,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => createAdminUserOptions(authClient, session.data?.user.id),
    queryClient
  )
}

export function useUpdateAdminUser(
  authClient: AdminAuthClient,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => updateAdminUserOptions(authClient, session.data?.user.id),
    queryClient
  )
}

export function useSetAdminUserRole(
  authClient: AdminAuthClient,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => setAdminUserRoleOptions(authClient, session.data?.user.id),
    queryClient
  )
}

export function useSetAdminUserPassword(
  authClient: AdminAuthClient,
  queryClient?: Accessor<QueryClient>
) {
  const mutation = useMutation(
    () =>
      setAdminUserPasswordOptions(authClient, () => {
        setTimeout(() => mutation.reset(), 0)
      }),
    queryClient
  )

  return mutation
}

export function useBanAdminUser(
  authClient: AdminAuthClient,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => banAdminUserOptions(authClient, session.data?.user.id),
    queryClient
  )
}

export function useUnbanAdminUser(
  authClient: AdminAuthClient,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => unbanAdminUserOptions(authClient, session.data?.user.id),
    queryClient
  )
}

export function useRevokeAdminUserSession(
  authClient: AdminAuthClient,
  targetUserId: Accessor<string | undefined>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () =>
      revokeAdminUserSessionOptions(
        authClient,
        session.data?.user.id,
        targetUserId()
      ),
    queryClient
  )
}

export function useRevokeAdminUserSessions(
  authClient: AdminAuthClient,
  targetUserId: Accessor<string | undefined>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () =>
      revokeAdminUserSessionsOptions(
        authClient,
        session.data?.user.id,
        targetUserId()
      ),
    queryClient
  )
}

export function useImpersonateAdminUser(
  authClient: AdminAuthClient,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => impersonateAdminUserOptions(authClient, session.data?.user.id),
    queryClient
  )
}

export function useRemoveAdminUser(
  authClient: AdminAuthClient,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => removeAdminUserOptions(authClient, session.data?.user.id),
    queryClient
  )
}
