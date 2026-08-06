import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { TwoFactorAuthClient } from "./two-factor-auth-client"
import { twoFactorMutationKeys } from "./two-factor-mutation-keys"

export type SendTwoFactorOtpParams<TAuthClient extends TwoFactorAuthClient> =
  Parameters<TAuthClient["twoFactor"]["sendOtp"]>[0]

export type SendTwoFactorOtpOptions<TAuthClient extends TwoFactorAuthClient> =
  Omit<
    ReturnType<typeof sendTwoFactorOtpOptions<TAuthClient>>,
    "mutationKey" | "mutationFn"
  >

/** Mutation options factory for emailing a second-factor code. */
export function sendTwoFactorOtpOptions<
  TAuthClient extends TwoFactorAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (
    // biome-ignore lint/suspicious/noConfusingVoidType: void allows no-arg mutate
    params?: SendTwoFactorOtpParams<TAuthClient> | void
  ) =>
    authClient.twoFactor.sendOtp({
      ...(params ?? {}),
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: twoFactorMutationKeys.sendOtp,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
