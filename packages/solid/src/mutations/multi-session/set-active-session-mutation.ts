import { authQueryKeys } from "@better-auth-ui/core"
import {
  multiSessionMutationKeys,
  multiSessionQueryKeys
} from "@better-auth-ui/core/plugins/multi-session"
import type { MultiSessionAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"
import { useSessionScopedMutation } from "../use-session-scoped-mutation"

export type SetActiveSessionParams<TAuthClient extends MultiSessionAuthClient> =
  Parameters<TAuthClient["multiSession"]["setActive"]>[0]

export type SetActiveSessionOptions = Parameters<
  typeof useSessionScopedMutation<
    MultiSessionAuthClient,
    MultiSessionAuthClient["multiSession"]["setActive"],
    typeof multiSessionMutationKeys.setActive
  >
>[4]

export function setActiveSessionOptions<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.multiSession.setActive,
    multiSessionMutationKeys.setActive
  )
}

export function useSetActiveSession<TAuthClient extends MultiSessionAuthClient>(
  authClient: TAuthClient,
  options?: SetActiveSessionOptions
) {
  return useSessionScopedMutation(
    authClient,
    authClient.multiSession.setActive,
    multiSessionMutationKeys.setActive,
    (userId) => ({
      awaits: [authQueryKeys.session, multiSessionQueryKeys.lists(userId)]
    }),
    options
  )
}
