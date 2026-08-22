import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { SsoAuthClient } from "./sso-auth-client"
import { ssoMutationKeys } from "./sso-mutation-keys"
import { ssoQueryKeys } from "./sso-query-keys"

export type DeleteSsoProviderParams = NonNullable<
  Parameters<SsoAuthClient["sso"]["deleteProvider"]>[0]
>

export function deleteSsoProviderOptions(
  authClient: SsoAuthClient,
  userId?: string
) {
  const mutationFn = (params: DeleteSsoProviderParams) =>
    authClient.sso.deleteProvider({
      ...params,
      fetchOptions: { ...params.fetchOptions, throw: true }
    })

  return {
    mutationKey: ssoMutationKeys.delete,
    mutationFn,
    meta: { awaits: [ssoQueryKeys.providers.all(userId)] }
  } satisfies MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    DeleteSsoProviderParams
  >
}
