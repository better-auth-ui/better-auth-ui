import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { SsoAuthClient } from "./sso-auth-client"
import { ssoMutationKeys } from "./sso-mutation-keys"
import { ssoQueryKeys } from "./sso-query-keys"

export type RegisterSsoProviderParams<TAuthClient extends SsoAuthClient> =
  Parameters<TAuthClient["sso"]["register"]>[0]

export type RegisterSsoProviderData = Awaited<
  ReturnType<SsoAuthClient["sso"]["register"]>
>

export type RegisterSsoProviderOptions<TAuthClient extends SsoAuthClient> =
  Omit<
    ReturnType<typeof registerSsoProviderOptions<TAuthClient>>,
    "mutationKey" | "mutationFn"
  >

/** Mutation options for registering an OIDC or SAML provider. */
export function registerSsoProviderOptions<TAuthClient extends SsoAuthClient>(
  authClient: TAuthClient,
  userId?: string
): MutationOptions<
  RegisterSsoProviderData,
  BetterFetchError,
  RegisterSsoProviderParams<TAuthClient>
> {
  const mutationFn = (params: RegisterSsoProviderParams<TAuthClient>) =>
    authClient.sso.register({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: ssoMutationKeys.register,
    mutationFn,
    meta: { awaits: [ssoQueryKeys.providers.all(userId)] }
  }
}
