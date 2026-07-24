import { createAuthPlugin } from "@better-auth-ui/core"
import {
  magicLinkPlugin as coreMagicLinkPlugin,
  type MagicLinkPluginOptions
} from "@better-auth-ui/core/plugins"

import { MagicLink } from "@/components/auth/magic-link"
import { MagicLinkButton } from "@/components/auth/magic-link-button"

export const magicLinkPlugin = createAuthPlugin(
  coreMagicLinkPlugin.id,
  (options: MagicLinkPluginOptions = {}) => ({
    ...coreMagicLinkPlugin(options),
    authButtons: [MagicLinkButton],
    views: {
      auth: { magicLink: MagicLink }
    },
    // Conditional, not an override: when `emailAndPassword.enabled === false`
    // the `<Auth>` router renders this at `/auth/sign-in` instead of the
    // disabled password form. With password auth on, the built-in `SignIn`
    // still wins.
    fallbackViews: {
      auth: { signIn: MagicLink }
    }
  })
)
