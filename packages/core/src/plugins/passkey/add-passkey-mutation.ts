import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { PasskeyAuthClient } from "./passkey-auth-client"
import { passkeyMutationKeys } from "./passkey-mutation-keys"
import { passkeyQueryKeys } from "./passkey-query-keys"

export type AddPasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<TAuthClient["passkey"]["addPasskey"]>[0]

export type AddPasskeyOptions<TAuthClient extends PasskeyAuthClient> = Omit<
  ReturnType<typeof addPasskeyOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for registering a new passkey.
 *
 * @param authClient - The Better Auth passkey client.
 * @param userId - The current signed-in user's ID. Used for cache partitioning.
 */
export function addPasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  userId?: string
) {
  const mutationKey = passkeyMutationKeys.addPasskey

  const mutationFn = (params: AddPasskeyParams<TAuthClient>) =>
    authClient.passkey.addPasskey({
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
