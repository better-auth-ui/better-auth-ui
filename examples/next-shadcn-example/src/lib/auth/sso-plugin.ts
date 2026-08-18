import { createAuthPlugin } from "@better-auth-ui/core"
import {
  ssoPlugin as coreSsoPlugin,
  type SsoPluginOptions
} from "@better-auth-ui/core/plugins/sso"

import { EmailFirstSignIn } from "@/components/auth/sso/email-first-sign-in"

export const ssoPlugin = createAuthPlugin(
  coreSsoPlugin.id,
  (options: SsoPluginOptions = {}) => {
    const plugin = coreSsoPlugin(options)

    return {
      ...plugin,
      ...(plugin.emailFirst && {
        views: { auth: { signIn: EmailFirstSignIn } }
      })
    }
  }
)
