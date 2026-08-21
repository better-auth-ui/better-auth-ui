import {
  type SsoAuthClient,
  type VerifySsoDomainOptions,
  verifySsoDomainOptions
} from "@better-auth-ui/core/plugins/sso"
import { useMutation } from "@tanstack/react-query"

/** Create a mutation for validating an SSO provider's DNS records. */
export function useVerifySsoDomain<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient,
  options?: VerifySsoDomainOptions<TAuthClient>
) {
  return useMutation({
    ...verifySsoDomainOptions(authClient),
    ...options
  })
}
