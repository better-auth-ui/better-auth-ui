import {
  type DeletePasskeyOptions,
  deletePasskeyOptions,
  type PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseDeletePasskeyOptions<TAuthClient extends PasskeyAuthClient> =
  Accessor<DeletePasskeyOptions<TAuthClient>>

export function useDeletePasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: UseDeletePasskeyOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...deletePasskeyOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
