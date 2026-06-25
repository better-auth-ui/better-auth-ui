import {
  type MagicLinkAuthClient,
  type SignInMagicLinkOptions,
  signInMagicLinkOptions
} from "@better-auth-ui/core/plugins/magic-link"
import { useMutation } from "@tanstack/solid-query"

export function useSignInMagicLink<TAuthClient extends MagicLinkAuthClient>(
  authClient: TAuthClient,
  options?: SignInMagicLinkOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...signInMagicLinkOptions(authClient),
    ...options
  }))
}
