import {
  type PasskeyAuthClient,
  type UpdatePasskeyOptions,
  updatePasskeyOptions
} from "@better-auth-ui/core/plugins/passkey"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/** Create a mutation for renaming a passkey. */
export function useUpdatePasskey<TAuthClient extends PasskeyAuthClient>(
  authClient: TAuthClient,
  options?: UpdatePasskeyOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)

  return useMutation(
    {
      ...updatePasskeyOptions(authClient, session?.user.id),
      ...options
    },
    queryClient
  )
}
