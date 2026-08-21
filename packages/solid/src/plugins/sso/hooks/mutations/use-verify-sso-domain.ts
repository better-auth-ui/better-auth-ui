import {
  type SsoAuthClient,
  type VerifySsoDomainOptions,
  verifySsoDomainOptions
} from "@better-auth-ui/core/plugins/sso"
import { useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseVerifySsoDomainOptions<TAuthClient extends SsoAuthClient> =
  Accessor<VerifySsoDomainOptions<TAuthClient>>

/** Create a mutation for validating an SSO provider's DNS records. */
export function useVerifySsoDomain<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient,
  options?: UseVerifySsoDomainOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...verifySsoDomainOptions(authClient),
    ...(options?.() ?? {})
  }))
}
