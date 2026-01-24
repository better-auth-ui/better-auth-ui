import type { AuthError } from "@better-auth-ui/core"
import { useAuth, useSession } from "@better-auth-ui/react"
import { type UseQueryOptions, useQuery } from "@tanstack/react-query"
import type { Session, User } from "better-auth"

type DeviceSession = {
  session: Session
  user: User
}

/**
 * Retrieve device sessions for multi-session account switching.
 *
 * The query is enabled only when `multiSession` is true and session data is available.
 *
 * @param options - Optional React Query options to customize the query behavior.
 * @returns The React Query result for the device sessions list; `data` is the array of device session objects and includes loading and error states.
 */
export function useListDeviceSessions(
  options?: Partial<UseQueryOptions<DeviceSession[], AuthError>>
) {
  const { authClient, multiSession } = useAuth()
  const { data: sessionData } = useSession()

  return useQuery<DeviceSession[], AuthError>({
    queryKey: [
      "auth",
      "multiSession",
      "listDeviceSessions",
      sessionData?.user.id
    ],
    queryFn: () =>
      authClient.multiSession.listDeviceSessions({
        fetchOptions: { throw: true }
      }),
    enabled: multiSession && !!sessionData,

    ...(options as object)
  })
}
