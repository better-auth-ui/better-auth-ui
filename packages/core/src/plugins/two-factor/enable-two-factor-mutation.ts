import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { TwoFactorAuthClient } from "./two-factor-auth-client"
import { twoFactorMutationKeys } from "./two-factor-mutation-keys"

export type EnableTwoFactorParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["enable"]>[0]

export type EnableTwoFactorOptions<TAuthClient extends TwoFactorAuthClient> =
  Omit<
    ReturnType<typeof enableTwoFactorOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/** Mutation options factory for enabling two-factor authentication. */
export function enableTwoFactorOptions<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient
) {
  const mutationFn = (params: EnableTwoFactorParams<TAuthClient>) =>
    authClient.twoFactor.enable({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: twoFactorMutationKeys.enable,
    mutationFn,
    meta: { awaits: [authQueryKeys.session] }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
