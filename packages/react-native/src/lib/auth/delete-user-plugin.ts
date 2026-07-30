import { createAuthPlugin } from "@better-auth-ui/core"
import {
  deleteUserPlugin as coreDeleteUserPlugin,
  type DeleteUserPluginOptions
} from "@better-auth-ui/core/plugins"
import { DangerZone } from "../../components/auth/delete-user/danger-zone"

/** React Native delete-user plugin. Adds the danger-zone security card. */
export const deleteUserPlugin = createAuthPlugin(
  coreDeleteUserPlugin.id,
  (options: DeleteUserPluginOptions = {}) => ({
    ...coreDeleteUserPlugin(options),
    securityCards: [DangerZone]
  })
)
