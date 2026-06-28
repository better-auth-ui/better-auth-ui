import type { AuthClient } from "@better-auth-ui/core"
import { type UseSessionOptions, useSession } from "../queries/use-session"

export function useUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseSessionOptions<TAuthClient>
) {
  const session = useSession(authClient, options)

  return {
    ...session,
    get data() {
      return session.data?.user
    }
  }
}
