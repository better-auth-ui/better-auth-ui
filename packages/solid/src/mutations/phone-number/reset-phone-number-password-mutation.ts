import { phoneNumberMutationKeys } from "@better-auth-ui/core/plugins"
import type { PhoneNumberAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type ResetPhoneNumberPasswordParams<
  TAuthClient extends PhoneNumberAuthClient
> = Parameters<TAuthClient["phoneNumber"]["resetPassword"]>[0]

/** Mutation options factory for resetting a password with a phone code. */
export function resetPhoneNumberPasswordOptions<
  TAuthClient extends PhoneNumberAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.phoneNumber.resetPassword,
    phoneNumberMutationKeys.resetPassword
  )
}
