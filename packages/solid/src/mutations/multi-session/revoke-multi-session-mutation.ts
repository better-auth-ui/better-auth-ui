import {
  multiSessionMutationKeys,
  multiSessionQueryKeys
} from "@better-auth-ui/core/plugins/multi-session"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import type { MultiSessionAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type RevokeMultiSessionParams<
  TAuthClient extends MultiSessionAuthClient
> = Parameters<TAuthClient["multiSession"]["revoke"]>[0]

export type RevokeMultiSessionOptions = Omit<
  ReturnType<typeof revokeMultiSessionOptions<MultiSessionAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function revokeMultiSessionOptions<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient, userId?: string) {
  return createAuthMutationOptions(
    authClient.multiSession.revoke,
    multiSessionMutationKeys.revoke,
    { awaits: [multiSessionQueryKeys.lists(userId)] }
  )
}

export function useRevokeMultiSession<
  TAuthClient extends MultiSessionAuthClient
>(authClient: TAuthClient, options?: RevokeMultiSessionOptions) {
  const session = useSession(authClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...revokeMultiSessionOptions(authClient, userId),
      ...options
    }
  })
}
