import {
  type RequestSsoDomainVerificationOptions,
  requestSsoDomainVerificationOptions,
  type SsoAuthClient
} from "@better-auth-ui/core/plugins/sso"
import { useMutation } from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

export type UseRequestSsoDomainVerificationOptions<
  TAuthClient extends SsoAuthClient
> = Accessor<RequestSsoDomainVerificationOptions<TAuthClient>>

/** Create a mutation for issuing a fresh SSO domain-verification token. */
export function useRequestSsoDomainVerification<
  TAuthClient extends SsoAuthClient
>(
  authClient: TAuthClient,
  options?: UseRequestSsoDomainVerificationOptions<TAuthClient>
) {
  return useMutation(() => ({
    ...requestSsoDomainVerificationOptions(authClient),
    ...(options?.() ?? {})
  }))
}
