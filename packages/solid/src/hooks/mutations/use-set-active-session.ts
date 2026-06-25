import {
  type MultiSessionAuthClient,
  type SetActiveSessionOptions,
  setActiveSessionOptions
} from "@better-auth-ui/core/plugins/multi-session"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../queries/use-session"

export function useSetActiveSession<TAuthClient extends MultiSessionAuthClient>(
  authClient: TAuthClient,
  options?: SetActiveSessionOptions<TAuthClient>
) {
  const session = useSession(authClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...setActiveSessionOptions(authClient, userId),
      ...options
    }
  })
}
