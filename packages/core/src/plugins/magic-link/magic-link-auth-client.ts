import type { createAuthClient } from "better-auth/client"
import type { magicLinkClient } from "better-auth/client/plugins"
import type { OmitUseAndStoreKeys } from "../../lib/auth-client"

type PluginMethodParams = Record<string, unknown> & {
  fetchOptions?: Record<string, unknown>
}

type PluginClientMethod = {
  method(params?: PluginMethodParams): Promise<unknown>
}["method"]

export type MagicLinkAuthClientContract = {
  signIn: {
    magicLink: PluginClientMethod
  }
}

export type MagicLinkAuthClient = OmitUseAndStoreKeys<
  ReturnType<
    typeof createAuthClient<{ plugins: [ReturnType<typeof magicLinkClient>] }>
  >
>
