import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { TwoFactorAuthClient } from "./two-factor-auth-client"
import { twoFactorMutationKeys } from "./two-factor-mutation-keys"

export type VerifyBackupCodeParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["verifyBackupCode"]>[0]

export type VerifyBackupCodeOptions<TAuthClient extends TwoFactorAuthClient> =
  Omit<
    ReturnType<typeof verifyBackupCodeOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/** Mutation options factory for recovering with a backup code. */
export function verifyBackupCodeOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (params: VerifyBackupCodeParams<TAuthClient>) =>
    authClient.twoFactor.verifyBackupCode({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: twoFactorMutationKeys.verifyBackupCode,
    mutationFn,
    meta: { awaits: [authQueryKeys.session] }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
