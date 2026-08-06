import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { PhoneNumberAuthClient } from "./phone-number-auth-client"
import { phoneNumberMutationKeys } from "./phone-number-mutation-keys"

export type VerifyPhoneNumberParams<TAuthClient extends PhoneNumberAuthClient> =
  Parameters<TAuthClient["phoneNumber"]["verify"]>[0]

export type VerifyPhoneNumberOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Omit<
  ReturnType<typeof verifyPhoneNumberOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/** Mutation options factory for verifying a phone-number code. */
export function verifyPhoneNumberOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (params: VerifyPhoneNumberParams<TAuthClient>) =>
    authClient.phoneNumber.verify({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: phoneNumberMutationKeys.verify,
    mutationFn,
    meta: { awaits: [authQueryKeys.session] }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
