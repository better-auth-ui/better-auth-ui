import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { PhoneNumberAuthClient } from "./phone-number-auth-client"
import { phoneNumberMutationKeys } from "./phone-number-mutation-keys"

export type SignInPhoneNumberParams<TAuthClient extends PhoneNumberAuthClient> =
  Parameters<TAuthClient["signIn"]["phoneNumber"]>[0]

export type SignInPhoneNumberOptions<
  TAuthClient extends PhoneNumberAuthClient
> = Omit<
  ReturnType<typeof signInPhoneNumberOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/** Mutation options factory for phone-number and password sign-in. */
export function signInPhoneNumberOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (params: SignInPhoneNumberParams<TAuthClient>) =>
    authClient.signIn.phoneNumber({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: phoneNumberMutationKeys.signIn,
    mutationFn,
    meta: { awaits: [authQueryKeys.session] }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
