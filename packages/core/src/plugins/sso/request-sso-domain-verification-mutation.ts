import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { SsoAuthClient } from "./sso-auth-client"
import { ssoMutationKeys } from "./sso-mutation-keys"

export type RequestSsoDomainVerificationParams<
  TAuthClient extends SsoAuthClient
> = Parameters<TAuthClient["sso"]["requestDomainVerification"]>[0]

export type RequestSsoDomainVerificationData = Awaited<
  ReturnType<SsoAuthClient["sso"]["requestDomainVerification"]>
>

export type RequestSsoDomainVerificationOptions<
  TAuthClient extends SsoAuthClient
> = Omit<
  ReturnType<typeof requestSsoDomainVerificationOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/** Mutation options for issuing a fresh SSO domain-verification token. */
export function requestSsoDomainVerificationOptions<
  TAuthClient extends SsoAuthClient
>(
  authClient: TAuthClient
): MutationOptions<
  RequestSsoDomainVerificationData,
  BetterFetchError,
  RequestSsoDomainVerificationParams<TAuthClient>
> {
  const mutationFn = (
    params: RequestSsoDomainVerificationParams<TAuthClient>
  ) =>
    authClient.sso.requestDomainVerification({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: ssoMutationKeys.requestDomainVerification,
    mutationFn
  }
}
