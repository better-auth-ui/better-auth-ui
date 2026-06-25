import {
  type AuthClient,
  type RequestPasswordResetOptions,
  requestPasswordResetOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export function useRequestPasswordReset<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: RequestPasswordResetOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...requestPasswordResetOptions(authClient),
    ...options
  }))
}
