import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import { authQueryKeys } from "../../lib/auth-query-keys"
import type { AnonymousAuthClient } from "./anonymous-auth-client"
import { anonymousMutationKeys } from "./anonymous-mutation-keys"

export type SignInAnonymousParams<TAuthClient extends AnonymousAuthClient> =
  Parameters<TAuthClient["signIn"]["anonymous"]>[0]

export type SignInAnonymousOptions<TAuthClient extends AnonymousAuthClient> =
  Omit<
    ReturnType<typeof signInAnonymousOptions<TAuthClient>>,
    "mutationKey" | "mutationFn" | "meta"
  >

/** Mutation options factory for signing in with an anonymous guest account. */
export function signInAnonymousOptions<TAuthClient extends AnonymousAuthClient>(
  authClient: TAuthClient
) {
  // biome-ignore lint/suspicious/noConfusingVoidType: void allows no-arg mutate
  const mutationFn = (params?: SignInAnonymousParams<TAuthClient> | void) =>
    authClient.signIn.anonymous({
      ...(params ?? {}),
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: anonymousMutationKeys.signIn,
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
