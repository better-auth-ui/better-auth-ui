import { type AuthClient, signOutOptions } from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export function useSignOut<TAuthClient extends AuthClient>(
  authClient: TAuthClient
) {
  return useMutation(() => signOutOptions(authClient))
}
