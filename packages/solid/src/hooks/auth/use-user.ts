import type { AuthClient } from "../../lib/auth-client"
import {
  type UseSessionOptions,
  useSession
} from "../../queries/auth/session-query"

export function useUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSessionOptions<TAuthClient>
) {
  const session = useSession(authClient, options)

  return {
    get data() {
      return session.data?.user
    },
    ...session
  }
}
