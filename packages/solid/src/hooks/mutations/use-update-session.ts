import {
  type AuthClient,
  type UpdateSessionOptions,
  updateSessionOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseUpdateSessionOptions<TAuthClient extends AuthClient> = Accessor<
  UpdateSessionOptions<TAuthClient>
>

export function useUpdateSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseUpdateSessionOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...updateSessionOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
