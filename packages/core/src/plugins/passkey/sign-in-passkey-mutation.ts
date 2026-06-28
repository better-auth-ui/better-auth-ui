import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { PasskeyAuthClient } from "./passkey-auth-client"
import { passkeyMutationKeys } from "./passkey-mutation-keys"

export type SignInPasskeyFn<TAuthClient extends PasskeyAuthClient> =
  TAuthClient["signIn"]["passkey"]

export type SignInPasskeyParams<TAuthClient extends PasskeyAuthClient> =
  Parameters<SignInPasskeyFn<TAuthClient>>[0]

export type SignInPasskeyOptions<TAuthClient extends PasskeyAuthClient> = Omit<
  ReturnType<typeof signInPasskeyOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for passkey sign-in.
 *
 * @param authClient - The Better Auth passkey client.
 */
export function signInPasskeyOptions<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient
) {
  const mutationKey = passkeyMutationKeys.signIn

  // biome-ignore lint/suspicious/noConfusingVoidType: void allows no-arg mutate
  const mutationFn = (params?: SignInPasskeyParams<TAuthClient> | void) =>
    authClient.signIn.passkey({
      ...(params ?? {}),
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn,
    meta: {
      awaits: [authQueryKeys.session]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
