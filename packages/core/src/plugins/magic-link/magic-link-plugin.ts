import { createAuthPlugin } from "../../lib/create-auth-plugin"
// Side-effect import so this file participates in declaration merging on the
// same module instance that external consumers reach via `@better-auth-ui/core`.
import type {} from "../../lib/view-paths"
import {
  type MagicLinkLocalization,
  magicLinkLocalization
} from "./magic-link-localization"

declare module "../../lib/view-paths" {
  /** Widens `AuthViewPaths` with the magic-link paths when this plugin is imported. */
  interface AuthViewPaths {
    /** @default "magic-link" */
    magicLink?: string
    /** @default "magic-link-sent" */
    magicLinkSent?: string
  }
}

export type MagicLinkPluginOptions = {
  /**
   * Override the plugin's default localization strings.
   * @remarks `MagicLinkLocalization`
   */
  localization?: Partial<MagicLinkLocalization>
  /**
   * URL segment for the magic-link view.
   * @remarks `string`
   * @default "magic-link"
   */
  path?: string
  /**
   * URL segment for the magic-link-sent confirmation view.
   * @remarks `string`
   * @default "magic-link-sent"
   */
  sentPath?: string
}

export const magicLinkPlugin = createAuthPlugin(
  "magicLink",
  (options: MagicLinkPluginOptions = {}) => ({
    localization: { ...magicLinkLocalization, ...options.localization },
    viewPaths: {
      auth: {
        magicLink: options.path ?? "magic-link",
        magicLinkSent: options.sentPath ?? "magic-link-sent"
      }
    }
  })
)
