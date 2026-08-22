import {
  type DeleteSsoProviderParams,
  deleteSsoProviderOptions,
  type SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import {
  type QueryClient,
  type UseMutationOptions,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"
import { useSession } from "../../../../hooks/queries/use-session"

type DeleteSsoProviderData = Awaited<
  ReturnType<SsoAuthClient["sso"]["deleteProvider"]>
>

export function useDeleteSsoProvider(
  authClient: SsoAuthClient,
  options?: UseMutationOptions<
    DeleteSsoProviderData,
    BetterFetchError,
    DeleteSsoProviderParams
  >,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  return useMutation(
    {
      ...deleteSsoProviderOptions(authClient, session?.user.id),
      ...options
    },
    queryClient
  )
}
