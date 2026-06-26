import type { apiKeyClient } from "@better-auth/api-key/client"
import type { createAuthClient } from "better-auth/client"
import type { OmitUseAndStoreKeys } from "../../lib/auth-client"

type PluginMethodParams = Record<string, unknown> & {
  fetchOptions?: Record<string, unknown>
}

type PluginClientMethod = {
  method(params?: PluginMethodParams): Promise<unknown>
}["method"]

export type ApiKeyAuthClientContract = {
  apiKey: {
    create: PluginClientMethod
    delete: PluginClientMethod
  }
}

export type ApiKeyAuthClient = OmitUseAndStoreKeys<
  ReturnType<
    typeof createAuthClient<{ plugins: [ReturnType<typeof apiKeyClient>] }>
  >
>
