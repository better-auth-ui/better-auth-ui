import {
  type AuthClient,
  type UpdateUserOptions,
  updateUserOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseUpdateUserOptions<TAuthClient extends AuthClient> = Accessor<
  UpdateUserOptions<TAuthClient>
>

export function useUpdateUser<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseUpdateUserOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...updateUserOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
