import { createAuthPlugin } from "@better-auth-ui/core"
import {
  multiSessionPlugin as coreMultiSessionPlugin,
  type MultiSessionPluginOptions
} from "@better-auth-ui/core/plugins"
import { ManageAccounts } from "../../components/auth/multi-session/manage-accounts"
import { SwitchAccountSubmenu } from "../../components/auth/multi-session/switch-account-submenu"

/**
 * React Native multi-session plugin. Adds the manage-accounts account card and
 * the account-switcher user-menu item.
 */
export const multiSessionPlugin = createAuthPlugin(
  coreMultiSessionPlugin.id,
  (options: MultiSessionPluginOptions = {}) => ({
    ...coreMultiSessionPlugin(options),
    accountCards: [ManageAccounts],
    userMenuItems: [SwitchAccountSubmenu]
  })
)
