import {
  type SsoAuthClient,
  type UpdateSsoProviderParams,
  updateSsoProviderOptions
} from "@better-auth-ui/core/plugins/sso"
import {
  type QueryClient,
  type UseMutationOptions,
  useMutation
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/client"
import { useSession } from "../../../../hooks/queries/use-session"

type UpdateSsoProviderData = Awaited<
  ReturnType<SsoAuthClient["sso"]["updateProvider"]>
>

export function useUpdateSsoProvider(
  authClient: SsoAuthClient,
  options?: UseMutationOptions<
    UpdateSsoProviderData,
    BetterFetchError,
    UpdateSsoProviderParams
  >,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  return useMutation(
    {
      ...updateSsoProviderOptions(authClient, session?.user.id),
      ...options
    },
    queryClient
  )
}
