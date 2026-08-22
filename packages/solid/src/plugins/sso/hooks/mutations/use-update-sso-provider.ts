import {
  type SsoAuthClient,
  updateSsoProviderOptions
} from "@better-auth-ui/core/plugins/sso"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export function useUpdateSsoProvider(
  authClient: SsoAuthClient,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => updateSsoProviderOptions(authClient, session.data?.user.id),
    queryClient
  )
}
