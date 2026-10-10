import { createAuthPlugin } from "@better-auth-ui/core"
import {
  lastLoginMethodPlugin as coreLastLoginMethodPlugin,
  type LastLoginMethodPluginOptions
} from "@better-auth-ui/core/plugins/last-login-method"

export type NativeLastLoginMethodOptions = LastLoginMethodPluginOptions & {
  /** Read a method from the app's storage when the client does not expose its cookies. */
  getLastLoginMethod?: () => string | null
  /** Match the server's custom last-login cookie name. */
  cookieName?: string
}
export const lastLoginMethodPlugin = createAuthPlugin(
  coreLastLoginMethodPlugin.id,
  (options: NativeLastLoginMethodOptions = {}) => ({
    ...coreLastLoginMethodPlugin(options),
    getLastLoginMethod: options.getLastLoginMethod,
    cookieName: options.cookieName ?? "better-auth.last_used_login_method"
  })
)
