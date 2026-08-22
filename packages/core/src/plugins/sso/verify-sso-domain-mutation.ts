import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { SsoAuthClient } from "./sso-auth-client"
import { ssoMutationKeys } from "./sso-mutation-keys"
import { ssoQueryKeys } from "./sso-query-keys"

export type VerifySsoDomainParams<TAuthClient extends SsoAuthClient> =
  Parameters<TAuthClient["sso"]["verifyDomain"]>[0]

export type VerifySsoDomainData = Awaited<
  ReturnType<SsoAuthClient["sso"]["verifyDomain"]>
>

export type VerifySsoDomainOptions<TAuthClient extends SsoAuthClient> = Omit<
  ReturnType<typeof verifySsoDomainOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/** Mutation options for validating an SSO provider's DNS records. */
export function verifySsoDomainOptions<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient,
  userId?: string
): MutationOptions<
  VerifySsoDomainData,
  BetterFetchError,
  VerifySsoDomainParams<TAuthClient>
> {
  const mutationFn = (params: VerifySsoDomainParams<TAuthClient>) =>
    authClient.sso.verifyDomain({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: ssoMutationKeys.verifyDomain,
    mutationFn,
    meta: { awaits: [ssoQueryKeys.providers.all(userId)] }
  }
}
