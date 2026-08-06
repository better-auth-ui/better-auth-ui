import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { TwoFactorAuthClient } from "./two-factor-auth-client"
import { twoFactorMutationKeys } from "./two-factor-mutation-keys"

export type DisableTwoFactorParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["disable"]>[0]

export type DisableTwoFactorOptions<TAuthClient extends TwoFactorAuthClient> =
  Omit<
    ReturnType<typeof disableTwoFactorOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/** Mutation options factory for disabling two-factor authentication. */
export function disableTwoFactorOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (params: DisableTwoFactorParams<TAuthClient>) =>
    authClient.twoFactor.disable({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: twoFactorMutationKeys.disable,
    mutationFn,
    meta: { awaits: [authQueryKeys.session] }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
