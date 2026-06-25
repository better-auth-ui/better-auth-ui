import {
  type AuthClient,
  type ChangeEmailOptions,
  changeEmailOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/**
 * Create a mutation for changing the current user's email address.
 */
export function useChangeEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: ChangeEmailOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...changeEmailOptions(authClient),
      ...options
    },
    queryClient
  )
}
