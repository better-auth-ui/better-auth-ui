import {
  type PasskeyAuthClient,
  type UpdatePasskeyOptions,
  updatePasskeyOptions
} from "@better-auth-ui/core/plugins/passkey"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseUpdatePasskeyOptions<TAuthClient extends PasskeyAuthClient> =
  Accessor<UpdatePasskeyOptions<TAuthClient>>

/** Create a mutation for renaming a passkey. */
export function useUpdatePasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: UseUpdatePasskeyOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(
    () => ({
      ...updatePasskeyOptions(authClient, session.data?.user.id),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
