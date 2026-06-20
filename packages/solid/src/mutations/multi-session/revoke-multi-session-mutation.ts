import {
  multiSessionMutationKeys,
  multiSessionQueryKeys
} from "@better-auth-ui/core/plugins/multi-session"
import type { MultiSessionAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"
import { useSessionScopedMutation } from "../use-session-scoped-mutation"

export type RevokeMultiSessionParams<
  TAuthClient extends MultiSessionAuthClient
> = Parameters<TAuthClient["multiSession"]["revoke"]>[0]

export type RevokeMultiSessionOptions = Parameters<
  typeof useSessionScopedMutation<
    MultiSessionAuthClient,
    MultiSessionAuthClient["multiSession"]["revoke"],
    typeof multiSessionMutationKeys.revoke
  >
>[4]

export function revokeMultiSessionOptions<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.multiSession.revoke,
    multiSessionMutationKeys.revoke
  )
}

export function useRevokeMultiSession<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient, options?: RevokeMultiSessionOptions) {
  return useSessionScopedMutation(
    authClient,
    authClient.multiSession.revoke,
    multiSessionMutationKeys.revoke,
    (userId) => ({ awaits: [multiSessionQueryKeys.lists(userId)] }),
    options
  )
}
