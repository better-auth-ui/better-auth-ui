import {
  type AuthClient,
  type LinkSocialOptions,
  linkSocialOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/react-query"

/**
 * Create a mutation for linking a social provider to the current user.
 */
export function useLinkSocial<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: LinkSocialOptions<TAuthClient>
) {
  return useMutation({
    ...linkSocialOptions(authClient),
    ...options
  })
}
