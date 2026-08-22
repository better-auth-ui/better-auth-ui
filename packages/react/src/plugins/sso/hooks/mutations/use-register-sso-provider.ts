import {
  type RegisterSsoProviderOptions,
  registerSsoProviderOptions,
  type SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import { type QueryClient, useMutation } from "@tanstack/react-query"
import { useSession } from "../../../../hooks/queries/use-session"

/** Create a mutation for registering an OIDC or SAML provider. */
export function useRegisterSsoProvider<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient,
  options?: RegisterSsoProviderOptions<TAuthClient>,
  queryClient?: QueryClient
) {
  const { data: session } = useSession(authClient, undefined, queryClient)
  return useMutation(
    {
      ...registerSsoProviderOptions(authClient, session?.user.id),
      ...options
    },
    queryClient
  )
}
