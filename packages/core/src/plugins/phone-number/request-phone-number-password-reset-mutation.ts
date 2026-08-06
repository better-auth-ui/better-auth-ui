import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { PhoneNumberAuthClient } from "./phone-number-auth-client"
import { phoneNumberMutationKeys } from "./phone-number-mutation-keys"

export type RequestPhoneNumberPasswordResetParams<
  TAuthClient extends PhoneNumberAuthClient
> = Parameters<TAuthClient["phoneNumber"]["requestPasswordReset"]>[0]

export type RequestPhoneNumberPasswordResetOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Omit<
  ReturnType<typeof requestPhoneNumberPasswordResetOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/** Mutation options factory for sending a phone password-reset code. */
export function requestPhoneNumberPasswordResetOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (
    params: RequestPhoneNumberPasswordResetParams<TAuthClient>
  ) =>
    authClient.phoneNumber.requestPasswordReset({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: phoneNumberMutationKeys.requestPasswordReset,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
