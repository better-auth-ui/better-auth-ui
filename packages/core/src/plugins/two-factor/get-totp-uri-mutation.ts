import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { TwoFactorAuthClient } from "./two-factor-auth-client"
import { twoFactorMutationKeys } from "./two-factor-mutation-keys"

export type GetTotpUriParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["getTotpUri"]>[0]

export type GetTotpUriOptions<TAuthClient extends TwoFactorAuthClient> = Omit<
  ReturnType<typeof getTotpUriOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/** Mutation options factory for re-reading an enrolled user's TOTP URI. */
export function getTotpUriOptions<TAuthClient extends TwoFactorAuthClient>(
  authClient: TAuthClient
) {
  const mutationFn = (params: GetTotpUriParams<TAuthClient>) =>
    authClient.twoFactor.getTotpUri({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: twoFactorMutationKeys.getTotpUri,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
