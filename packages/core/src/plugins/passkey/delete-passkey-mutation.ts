import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { PasskeyAuthClient } from "./passkey-auth-client"
import { passkeyMutationKeys } from "./passkey-mutation-keys"
import { passkeyQueryKeys } from "./passkey-query-keys"

export type DeletePasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["deletePasskey"]>[0]

export type DeletePasskeyOptions<TAuthClient extends PasskeyAuthClient> = Omit<
  ReturnType<typeof deletePasskeyOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for deleting a passkey.
 *
 * @param authClient - The Better Auth passkey client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 */
export function deletePasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  const mutationKey = passkeyMutationKeys.deletePasskey

  const mutationFn = (params: DeletePasskeyParams<TAuthClient>) =>
    authClient.passkey.deletePasskey({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [passkeyQueryKeys.lists(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
