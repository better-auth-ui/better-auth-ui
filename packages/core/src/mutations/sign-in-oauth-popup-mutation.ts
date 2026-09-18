import type {
  MutationFunctionContext,
  MutationOptions
} from "@tanstack/query-core"
import type {
  SignInPopupOptions,
  SignInPopupResult
} from "better-auth/client/plugins"
import type { AuthClient } from "../lib/auth-client"
import { authMutationKeys } from "../lib/auth-mutation-keys"
import { authQueryKeys } from "../lib/auth-query-keys"
import { fetchSession } from "../queries/auth/session-query"

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
  const mutationFn = async (
    params: SignInOAuthPopupParams,
    { client }: MutationFunctionContext
  ) => {
    const result = await authClient.signIn.popup(params)

    if (result.error) {
      throw result.error
    }

    // Popup sign-in refreshes Better Auth's store, not the query cache used by
    // route guards. Replace any pre-login request before success can navigate.
    await client.cancelQueries({ queryKey: authQueryKeys.session })
    await fetchSession(client, authClient, { staleTime: 0 })

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
