import {
  type AuthClient,
  authQueryKeys,
  type UpdateUserOptions,
  updateUserOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/react-query"

/**
 * Create a mutation for updating the authenticated user's profile.
 *
 * On success, `MutationInvalidator` awaits invalidation of the session
 * query so the updated user fields are reflected (see `meta.awaits`).
 *
 * @param authClient - The Better Auth client.
 * @param options - React Query options forwarded to `useMutation`.
 */
export function useUpdateUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UpdateUserOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  return useMutation(
    {
      ...updateUserOptions(authClient),
      ...options,
      meta: {
        awaits: [authQueryKeys.session]
      }
    },
    queryClient
  )
}

function Test() {
  const { mutateAsync, error } = useUpdateUser({} as AuthClient)

  async function testFunction() {
    const result = await mutateAsync({ name: "" })
  }
}
