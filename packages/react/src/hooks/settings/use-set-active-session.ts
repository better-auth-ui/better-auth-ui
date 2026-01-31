import {
  type AuthClient,
  useAuth,
  useAuthMutation,
  useListDeviceSessions,
  useSession
} from "@better-auth-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import type { UseAuthMutationOptions } from "../auth/use-auth-mutation"

/**
 * Hook that sets an active device session in multi-session mode.
 *
 * @returns The `useMutation` result.
 */
export function useSetActiveSession(
  options?: UseAuthMutationOptions<AuthClient["multiSession"]["setActive"]>
) {
  const queryClient = useQueryClient()
  const { authClient } = useAuth()

  const { refetch: refetchSession } = useSession()
  const { data: deviceSessions, refetch: refetchDeviceSessions } =
    useListDeviceSessions()

  return useAuthMutation({
    authFn: authClient.multiSession.setActive,
    options: {
      ...options,
      onSuccess: async (data, { sessionToken }, ...args) => {
        const deviceSession = deviceSessions?.find(
          (session) => session.session.token === sessionToken
        )

        if (deviceSession)
          queryClient.setQueryData(["auth", "getSession"], deviceSession)

        window.scrollTo({ top: 0 })

        await refetchSession()
        await refetchDeviceSessions()
        await options?.onSuccess?.(data, { sessionToken }, ...args)
      }
    }
  })
}
