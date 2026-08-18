import {
  type SignInSsoOptions,
  type SsoAuthClient,
  signInSsoOptions
} from "@better-auth-ui/core/plugins/sso"
import { useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseSignInSsoOptions<TAuthClient extends SsoAuthClient> = Accessor<
  SignInSsoOptions<TAuthClient>
>

/** Create a mutation for discovering and starting SSO sign-in. */
export function useSignInSso<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient,
  options?: UseSignInSsoOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...signInSsoOptions(authClient),
    ...(options?.() ?? {})
  }))
}
