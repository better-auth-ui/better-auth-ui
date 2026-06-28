import {
  type AddPasskeyOptions,
  addPasskeyOptions,
  type PasskeyAuthClient
} from "@better-auth-ui/core/plugins/passkey"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseAddPasskeyOptions<TAuthClient extends PasskeyAuthClient> =
  Accessor<AddPasskeyOptions<TAuthClient>>

export function useAddPasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: UseAddPasskeyOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)

  return useMutation(() => {
    const userId = session.data?.user.id

    return {
      ...addPasskeyOptions(authClient, userId),
      ...(options?.() ?? {})
    }
  }, queryClient)
}
