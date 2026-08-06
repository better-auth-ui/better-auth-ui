import {
  type AuthClient,
  type UnlinkAccountOptions,
  unlinkAccountOptions
} from "@better-auth-ui/core"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../queries/use-session"

export type UseUnlinkAccountOptions<TAuthClient extends AuthClient> = Accessor<
  UnlinkAccountOptions<TAuthClient>
>

export function useUnlinkAccount<TAuthClient extends AuthClient>(
  authClient: TAuthClient,
  options?: UseUnlinkAccountOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...unlinkAccountOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
