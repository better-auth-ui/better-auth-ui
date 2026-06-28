import {
  type AuthClient,
  type RevokeSessionOptions,
  revokeSessionOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../queries/use-session"

export type UseRevokeSessionOptions<TAuthClient extends AuthClient> = Accessor<
  RevokeSessionOptions<TAuthClient>
>

export function useRevokeSession<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseRevokeSessionOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...revokeSessionOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
