import {
  type RegisterSsoProviderOptions,
  registerSsoProviderOptions,
  type SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import { useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseRegisterSsoProviderOptions<TAuthClient extends SsoAuthClient> =
  Accessor<RegisterSsoProviderOptions<TAuthClient>>

/** Create a mutation for registering an OIDC or SAML provider. */
export function useRegisterSsoProvider<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient,
  options?: UseRegisterSsoProviderOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...registerSsoProviderOptions(authClient),
    ...(options?.() ?? {})
  }))
}
