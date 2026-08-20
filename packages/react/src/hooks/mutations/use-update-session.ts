import {
  type AuthClient,
  type UpdateSessionOptions,
  updateSessionOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/** Create a mutation for updating additional fields on the current session. */
export function useUpdateSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UpdateSessionOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...updateSessionOptions(authClient),
      ...options
    },
    queryClient
  )
}
