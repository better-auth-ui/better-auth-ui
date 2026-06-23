import { authQueryKeys } from "@better-auth-ui/core"
import { usernameMutationKeys } from "@better-auth-ui/core/plugins/username"
import { useMutation } from "@tanstack/solid-query"
import type { UsernameAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignInUsernameParams<TAuthClient extends UsernameAuthClient> =
  Parameters<TAuthClient["signIn"]["username"]>[0]

export type SignInUsernameOptions = Omit<
  ReturnType<typeof signInUsernameOptions<UsernameAuthClient>>,
  "mutationKey" | "mutationFn"
>

export function signInUsernameOptions<TAuthClient extends UsernameAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.signIn.username,
    usernameMutationKeys.signIn,
    { awaits: [authQueryKeys.session] }
  )
}

export function useSignInUsername<TAuthClient extends UsernameAuthClient>(
  authClient: TAuthClient,
  options?: SignInUsernameOptions
) {
  return useMutation(() => ({
    ...signInUsernameOptions(authClient),
    ...options
  }))
}
