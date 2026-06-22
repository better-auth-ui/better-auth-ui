import {
  type AuthClient,
  type LinkSocialOptions,
  linkSocialOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export type { LinkSocialParams } from "@better-auth-ui/core"

export function useLinkSocial<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: LinkSocialOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...linkSocialOptions(authClient),
    ...options
  }))
}
export const linkSocialMutation = useLinkSocial
