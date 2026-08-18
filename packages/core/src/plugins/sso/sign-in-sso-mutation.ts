import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { SsoAuthClient } from "./sso-auth-client"
import { ssoMutationKeys } from "./sso-mutation-keys"

export type SignInSsoParams<TAuthClient extends SsoAuthClient> = Parameters<
  TAuthClient["signIn"]["sso"]
>[0]

export type SignInSsoOptions<TAuthClient extends SsoAuthClient> = Omit<
  ReturnType<typeof signInSsoOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/** Mutation options for SSO discovery and sign-in. */
export function signInSsoOptions<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient
) {
  const mutationFn = (params: SignInSsoParams<TAuthClient>) =>
    authClient.signIn.sso({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: ssoMutationKeys.signIn,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
