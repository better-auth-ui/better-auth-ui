import {
  type AuthClient,
  type DeleteUserOptions,
  deleteUserOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseDeleteUserOptions<TAuthClient extends AuthClient> = Accessor<
  DeleteUserOptions<TAuthClient>
>

export function useDeleteUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseDeleteUserOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...deleteUserOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
