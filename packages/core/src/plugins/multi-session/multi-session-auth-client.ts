import type { createAuthClient } from "better-auth/client"
import type { multiSessionClient } from "better-auth/client/plugins"
import type { OmitUseAndStoreKeys } from "../../lib/auth-client"

type PluginMethodParams = Record<string, unknown> & {
  fetchOptions?: Record<string, unknown>
}

type PluginClientMethod = {
  method(params?: PluginMethodParams): Promise<unknown>
}["method"]

export type MultiSessionAuthClientContract = {
  multiSession: {
    revoke: PluginClientMethod
    setActive: PluginClientMethod
  }
}

export type MultiSessionAuthClient = OmitUseAndStoreKeys<
  ReturnType<
    typeof createAuthClient<{
      plugins: [ReturnType<typeof multiSessionClient>]
    }>
  >
>
