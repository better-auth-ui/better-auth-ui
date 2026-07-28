import { authQueryKeys } from "@better-auth-ui/core"
import { phoneNumberMutationKeys } from "@better-auth-ui/core/plugins"
import type { PhoneNumberAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignInPhoneNumberParams<TAuthClient extends PhoneNumberAuthClient> =
  Parameters<TAuthClient["signIn"]["phoneNumber"]>[0]

/** Mutation options factory for phone-number and password sign-in. */
export function signInPhoneNumberOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.signIn.phoneNumber,
    phoneNumberMutationKeys.signIn,
    { awaits: [authQueryKeys.session] }
  )
}
