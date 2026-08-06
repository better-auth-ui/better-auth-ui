import {
  type MagicLinkAuthClient,
  type SignInMagicLinkOptions,
  signInMagicLinkOptions
} from "@better-auth-ui/core/plugins/magic-link"
import { useMutation } from "@tanstack/react-query"

/**
 * Create a mutation for requesting a magic-link sign-in email.
 *
 * Wraps `authClient.signIn.magicLink` and forwards React Query mutation
 * options such as `onSuccess`, `onError`, and `retry`.
 *
 * @param authClient - The Better Auth client with the magic-link plugin.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useSignInMagicLink<TAuthClient extends MagicLinkAuthClient>(
  authClient: TAuthClient,
  options?: SignInMagicLinkOptions<TAuthClient>
) {
  return useMutation({
    ...signInMagicLinkOptions(authClient),
    ...options
  })
}
