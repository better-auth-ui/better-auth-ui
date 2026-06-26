import {
  passkeyMutationKeys,
  passkeyQueryKeys
} from "@better-auth-ui/core/plugins/passkey"
import { useMutation } from "@tanstack/solid-query"
import { useSession } from "../../../hooks/queries/use-session"
import { createAuthMutationOptions } from "../../../mutations/create-auth-mutation"
import type { PasskeyAuthClient } from "../passkey-auth-client"

export type AddPasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["addPasskey"]>[0]

export type AddPasskeyOptions = Omit<
  ReturnType<typeof addPasskeyOptions<PasskeyAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

export function addPasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  return createAuthMutationOptions(
    authClient.passkey.addPasskey,
    passkeyMutationKeys.addPasskey,
    { awaits: [passkeyQueryKeys.lists(userId)] }
  )
}

export function useAddPasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: AddPasskeyOptions
) {
  const session = useSession(authClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...addPasskeyOptions(authClient, userId),
      ...options
    }
  })
}
