import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { TwoFactorAuthClient } from "./two-factor-auth-client"
import { twoFactorMutationKeys } from "./two-factor-mutation-keys"

export type GenerateBackupCodesParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["generateBackupCodes"]>[0]

export type GenerateBackupCodesOptions<
  TAuthClient extends TwoFactorAuthClient
> = Omit<
  ReturnType<typeof generateBackupCodesOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/** Mutation options factory for regenerating backup codes. */
export function generateBackupCodesOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (params: GenerateBackupCodesParams<TAuthClient>) =>
    authClient.twoFactor.generateBackupCodes({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: twoFactorMutationKeys.generateBackupCodes,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
