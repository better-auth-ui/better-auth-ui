import {
  passkeyMutationKeys,
  passkeyQueryKeys
} from "@better-auth-ui/core/plugins/passkey"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../../hooks/queries/use-session"
import type { PasskeyAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type DeletePasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["deletePasskey"]>[0]

export type DeletePasskeyOptions = Omit<
  ReturnType<typeof deletePasskeyOptions<PasskeyAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function deletePasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  return createAuthMutationOptions(
    authClient.passkey.deletePasskey,
    passkeyMutationKeys.deletePasskey,
    { awaits: [passkeyQueryKeys.lists(userId)] }
  )
}

export function useDeletePasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: DeletePasskeyOptions
) {
  const session = useSession(authClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...deletePasskeyOptions(authClient, userId),
      ...options
    }
  })
}
