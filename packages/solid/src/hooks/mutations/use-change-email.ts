import {
  type AuthClient,
  type ChangeEmailOptions,
  changeEmailOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseChangeEmailOptions<TAuthClient extends AuthClient> = Accessor<
  ChangeEmailOptions<TAuthClient>
>

export function useChangeEmail<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseChangeEmailOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  return useMutation(
    () => ({
      ...changeEmailOptions(authClient),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
