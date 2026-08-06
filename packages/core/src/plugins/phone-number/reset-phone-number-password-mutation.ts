import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { PhoneNumberAuthClient } from "./phone-number-auth-client"
import { phoneNumberMutationKeys } from "./phone-number-mutation-keys"

export type ResetPhoneNumberPasswordParams<
  TAuthClient extends PhoneNumberAuthClient
> = Parameters<TAuthClient["phoneNumber"]["resetPassword"]>[0]

export type ResetPhoneNumberPasswordOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Omit<
  ReturnType<typeof resetPhoneNumberPasswordOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/** Mutation options factory for resetting a password with a phone code. */
export function resetPhoneNumberPasswordOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (params: ResetPhoneNumberPasswordParams<TAuthClient>) =>
    authClient.phoneNumber.resetPassword({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: phoneNumberMutationKeys.resetPassword,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
