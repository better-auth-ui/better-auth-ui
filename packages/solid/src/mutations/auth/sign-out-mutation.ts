import {
  type AuthClient,
  type SignOutOptions,
  signOutOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export function useSignOutMutation<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: SignOutOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...signOutOptions(authClient),
    ...options
  }))
}
export const signOutMutation = useSignOutMutation
