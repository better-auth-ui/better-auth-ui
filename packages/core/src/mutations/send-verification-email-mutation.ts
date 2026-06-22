import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"

export type SendVerificationEmailParams<TAuthClient extends AuthClient> =
  Parameters<TAuthClient["sendVerificationEmail"]>[0]

export type SendVerificationEmailOptions<TAuthClient extends AuthClient> = Omit<
  ReturnType<typeof sendVerificationEmailOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for sending a verification email.
 *
 * @param authClient - The Better Auth client.
 */
export function sendVerificationEmailOptions<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = authMutationKeys.sendVerificationEmail

  const mutationFn = (params: SendVerificationEmailParams<TAuthClient>) =>
    authClient.sendVerificationEmail({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
