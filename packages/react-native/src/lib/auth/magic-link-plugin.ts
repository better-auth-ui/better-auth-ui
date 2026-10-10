import { createAuthPlugin } from "@better-auth-ui/core"
import {
  magicLinkPlugin as coreMagicLinkPlugin,
  type MagicLinkPluginOptions
} from "@better-auth-ui/core/plugins/magic-link"
import { MagicLinkSent } from "../../components/auth/email-link-sent"
import { MagicLink } from "../../components/auth/magic-link/magic-link"
import { MagicLinkButton } from "../../components/auth/magic-link/magic-link-button"

/**
 * React Native magic-link plugin. Registers the RN `MagicLink` view + toggle
 * button. Mirrors the heroui registration.
 */
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
