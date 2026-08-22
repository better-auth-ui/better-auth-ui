import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { SsoAuthClient } from "./sso-auth-client"
import { ssoMutationKeys } from "./sso-mutation-keys"
import { ssoQueryKeys } from "./sso-query-keys"

export type UpdateSsoProviderParams = NonNullable<
  Parameters<SsoAuthClient["sso"]["updateProvider"]>[0]
>

export function updateSsoProviderOptions(
  authClient: SsoAuthClient,
  userId?: string
) {
  const mutationFn = (params: UpdateSsoProviderParams) =>
    authClient.sso.updateProvider({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: ssoMutationKeys.update,
    mutationFn,
    meta: { awaits: [ssoQueryKeys.providers.all(userId)] }
  } satisfies MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    UpdateSsoProviderParams
  >
}
