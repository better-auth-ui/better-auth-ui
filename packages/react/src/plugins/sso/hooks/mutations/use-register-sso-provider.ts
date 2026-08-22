import {
  type RegisterSsoProviderOptions,
  registerSsoProviderOptions,
  type SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import { useMutation } from "@tanstack/react-query"

/** Create a mutation for registering an OIDC or SAML provider. */
export function useRegisterSsoProvider<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient,
  options?: RegisterSsoProviderOptions<TAuthClient>
) {
  return useMutation({
    ...registerSsoProviderOptions(authClient),
    ...options
  })
}
