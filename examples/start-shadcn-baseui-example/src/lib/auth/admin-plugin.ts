import { createAuthPlugin } from "@better-auth-ui/core"
import {
  type AdminPluginOptions,
  adminPlugin as coreAdminPlugin
} from "@better-auth-ui/core/plugins"

import { StopImpersonating } from "@/components/auth/admin/stop-impersonating"

export const adminPlugin = createAuthPlugin(
  coreAdminPlugin.id,
  (options: AdminPluginOptions = {}) => ({
    ...coreAdminPlugin(options),
    userMenuItems: [StopImpersonating]
  })
)
