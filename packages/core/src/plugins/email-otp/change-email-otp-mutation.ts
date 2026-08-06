import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { EmailOtpAuthClient } from "./email-otp-auth-client"
import { emailOtpMutationKeys } from "./email-otp-mutation-keys"

export type ChangeEmailOtpParams<TAuthClient extends EmailOtpAuthClient> =
  Parameters<TAuthClient["emailOtp"]["changeEmail"]>[0]

export type ChangeEmailOtpOptions<TAuthClient extends EmailOtpAuthClient> =
  Omit<
    ReturnType<typeof changeEmailOtpOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/** Mutation options factory for confirming an email change with a code. */
export function changeEmailOtpOptions<TAuthClient extends EmailOtpAuthClient>(
  authClient: TAuthClient
) {
  const mutationFn = (params: ChangeEmailOtpParams<TAuthClient>) =>
    authClient.emailOtp.changeEmail({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: emailOtpMutationKeys.changeEmail,
    mutationFn,
    meta: { awaits: [authQueryKeys.session] }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
