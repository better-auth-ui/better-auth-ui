import { createAuthPlugin } from "@better-auth-ui/core"
import {
  magicLinkPlugin as coreMagicLinkPlugin,
  type MagicLinkPluginOptions
} from "@better-auth-ui/core/plugins"

import { MagicLink } from "@/components/auth/magic-link"
import { MagicLinkButton } from "@/components/auth/magic-link-button"
import { MagicLinkSent } from "@/components/auth/magic-link-sent"

export const magicLinkPlugin = createAuthPlugin(
  coreMagicLinkPlugin.id,
  (options: MagicLinkPluginOptions = {}) => ({
    ...coreMagicLinkPlugin(options),
    authButtons: [MagicLinkButton],
    views: {
      auth: { magicLink: MagicLink, magicLinkSent: MagicLinkSent }
    },
    fallbackViews: {
      auth: { signIn: MagicLink }
    }
  })
)
