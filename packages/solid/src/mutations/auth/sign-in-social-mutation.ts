import {
  type AuthClient,
  type SignInSocialOptions,
  signInSocialOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export type { SignInSocialParams } from "@better-auth-ui/core"

export function useSignInSocial<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignInSocialOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...signInSocialOptions(authClient),
    ...options
  }))
}
export const signInSocialMutation = useSignInSocial
