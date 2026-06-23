import { magicLinkMutationKeys } from "@better-auth-ui/core/plugins/magic-link"
import { useMutation } from "@tanstack/solid-query"
import type { MagicLinkAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type SignInMagicLinkParams<TAuthClient extends MagicLinkAuthClient> =
  Parameters<TAuthClient["signIn"]["magicLink"]>[0]

export type SignInMagicLinkOptions = Omit<
  ReturnType<typeof signInMagicLinkOptions<MagicLinkAuthClient>>,
  "mutationKey" | "mutationFn"
>

export function signInMagicLinkOptions<TAuthClient extends MagicLinkAuthClient>(
  authClient: TAuthClient
) {
  return createAuthMutationOptions(
    authClient.signIn.magicLink,
    magicLinkMutationKeys.signIn
  )
}

export function useSignInMagicLink<TAuthClient extends MagicLinkAuthClient>(
  authClient: TAuthClient,
  options?: SignInMagicLinkOptions
) {
  return useMutation(() => ({
    ...signInMagicLinkOptions(authClient),
    ...options
  }))
}
