import type { MultiSessionAuthClient } from "@better-auth-ui/core/plugins/multi-session"
import {
  type SetActiveSessionOptions,
  setActiveSessionOptions
} from "@better-auth-ui/core/plugins/multi-session"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseSetActiveSessionOptions<
  TAuthClient extends MultiSessionAuthClient
> = Accessor<SetActiveSessionOptions<TAuthClient>>

export function useSetActiveSession<TAuthClient extends MultiSessionAuthClient>(
  authClient: TAuthClient,
  options?: UseSetActiveSessionOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...setActiveSessionOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
