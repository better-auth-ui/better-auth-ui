import {
  type AuthClient,
  type ChangeEmailOptions,
  changeEmailOptions
} from "@better-auth-ui/core"
import { useMutation } from "@tanstack/solid-query"

export type { ChangeEmailParams } from "@better-auth-ui/core"

export function useChangeEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: ChangeEmailOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...changeEmailOptions(authClient),
    ...options
  }))
}
export const changeEmailMutation = useChangeEmail
