import type { MutationOptions } from "@tanstack/query-core"
import type {
  SignInPopupOptions,
  SignInPopupResult
} from "better-auth/client/plugins"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"

export type OAuthPopupAuthClient<TAuthClient extends AuthClient = AuthClient> =
  TAuthClient & {
    signIn: TAuthClient["signIn"] & {
      popup: (params: SignInPopupOptions) => Promise<SignInPopupResult>
    }
  }

export type SignInOAuthPopupParams = SignInPopupOptions
export type SignInOAuthPopupError = NonNullable<SignInPopupResult["error"]>

export type SignInOAuthPopupOptions<TAuthClient extends OAuthPopupAuthClient> =
  Omit<
    ReturnType<typeof signInOAuthPopupOptions<TAuthClient>>,
    "mutationKey" | "mutationFn"
  >

/** Mutation options factory for Better Auth's experimental OAuth popup flow. */
export function signInOAuthPopupOptions<
  TAuthClient extends OAuthPopupAuthClient
>(authClient: TAuthClient) {
  const mutationFn = async (params: SignInOAuthPopupParams) => {
    const result = await authClient.signIn.popup(params)

    if (result.error) {
      throw result.error
    }

    return result
  }

  return {
    mutationKey: authMutationKeys.signIn.popup,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    SignInOAuthPopupError,
    Parameters<typeof mutationFn>[0]
  >
}
