import { authQueryKeys } from "@better-auth-ui/core"
import {
  multiSessionMutationKeys,
  multiSessionQueryKeys
} from "@better-auth-ui/core/plugins/multi-session"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import type { MultiSessionAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SetActiveSessionParams<TAuthClient extends MultiSessionAuthClient> =
  Parameters<TAuthClient["multiSession"]["setActive"]>[0]

export type SetActiveSessionOptions = Omit<
  ReturnType<typeof setActiveSessionOptions<MultiSessionAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function setActiveSessionOptions<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient, userId?: string) {
  return createAuthMutationOptions(
    authClient.multiSession.setActive,
    multiSessionMutationKeys.setActive,
    { awaits: [authQueryKeys.session, multiSessionQueryKeys.lists(userId)] }
  )
}

export function useSetActiveSession<TAuthClient extends MultiSessionAuthClient>(
  authClient: TAuthClient,
  options?: SetActiveSessionOptions
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
