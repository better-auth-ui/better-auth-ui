import {
  type RequestSsoDomainVerificationOptions,
  requestSsoDomainVerificationOptions,
  type SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import { useMutation } from "@tanstack/react-query"

/** Create a mutation for issuing a fresh SSO domain-verification token. */
export function useRequestSsoDomainVerification<
  TAuthClient extends SsoAuthClient
>(
  authClient: TAuthClient,
  options?: RequestSsoDomainVerificationOptions<TAuthClient>
) {
  return useMutation({
    ...requestSsoDomainVerificationOptions(authClient),
    ...options
  })
}
