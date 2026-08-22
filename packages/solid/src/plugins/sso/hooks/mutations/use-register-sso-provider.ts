import {
  type RegisterSsoProviderOptions,
  registerSsoProviderOptions,
  type SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"
import { useSession } from "../../../../hooks/queries/use-session"

export type UseRegisterSsoProviderOptions<TAuthClient extends SsoAuthClient> =
  Accessor<RegisterSsoProviderOptions<TAuthClient>>

/** Create a mutation for registering an OIDC or SAML provider. */
export function useRegisterSsoProvider<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient,
  options?: UseRegisterSsoProviderOptions<TAuthClient>,
  queryClient?: Accessor<QueryClient>
) {
  const session = useSession(authClient, undefined, queryClient)
  return useMutation(
    () => ({
      ...registerSsoProviderOptions(authClient, session.data?.user.id),
      ...(options?.() ?? {})
    }),
    queryClient
  )
}
