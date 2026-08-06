import {
  type IsUsernameAvailableOptions,
  isUsernameAvailableOptions,
  type UsernameAuthClient
} from "@better-auth-ui/core/plugins/username"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseIsUsernameAvailableOptions<
  TAuthClient extends UsernameAuthClient
> = Accessor<IsUsernameAvailableOptions<TAuthClient>>

export function useIsUsernameAvailable<TAuthClient extends UsernameAuthClient>(
  authClient: TAuthClient,
  options?: UseIsUsernameAvailableOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...isUsernameAvailableOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
