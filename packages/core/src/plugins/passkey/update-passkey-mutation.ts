import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { PasskeyAuthClient } from "./passkey-auth-client"
import { passkeyMutationKeys } from "./passkey-mutation-keys"
import { passkeyQueryKeys } from "./passkey-query-keys"

export type UpdatePasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["updatePasskey"]>[0]

export type UpdatePasskeyOptions<TAuthClient extends PasskeyAuthClient> = Omit<
  ReturnType<typeof updatePasskeyOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/** Mutation options factory for renaming a passkey. */
export function updatePasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  const mutationFn = (params: UpdatePasskeyParams<TAuthClient>) =>
    authClient.passkey.updatePasskey({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: passkeyMutationKeys.updatePasskey,
    mutationFn,
    meta: { awaits: [passkeyQueryKeys.lists(userId)] }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
