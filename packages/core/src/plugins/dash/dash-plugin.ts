import { createAuthPlugin } from "../../lib/create-auth-plugin"
import type {} from "../../lib/view-paths"
import {
  type DashLocalizationOverrides,
  dashLocalization
} from "./dash-localization"

declare module "../../lib/view-paths" {
  interface SettingsViewPaths {
    /** @default "activity" */
    activity?: string
  }
}

export type DashPluginOptions = {
  /** Add activity to the admin user inspector. @default true */
  admin?: boolean
  /** Add activity to personal settings. @default true */
  user?: boolean
  /** Add activity to organization settings. @default true */
  organization?: boolean
  /** Number of events loaded per page. Clamped to 1–100. @default 20 */
  pageSize?: number
  /** Show recorded IP addresses next to event locations. @default false */
  showIpAddress?: boolean
  /** @default "activity" */
  path?: string
  localization?: DashLocalizationOverrides
}

const resolvePageSize = (pageSize?: number) => {
  const value = pageSize ?? 20
  return Number.isFinite(value)
    ? Math.min(100, Math.max(1, Math.floor(value)))
    : 20
}

/**
 * Adds user and organization activity views backed by Better Auth
 * Infrastructure Dash audit logs.
 *
 * Pair this UI plugin with `dash()` on the server and `dashClient()` on the
 * Better Auth client.
 */
export const dashPlugin = createAuthPlugin(
  "dash",
  (options: DashPluginOptions = {}) => ({
    admin: options.admin ?? true,
    user: options.user ?? true,
    organization: options.organization ?? true,
    pageSize: resolvePageSize(options.pageSize),
    showIpAddress: options.showIpAddress ?? false,
    localization: {
      ...dashLocalization,
      ...options.localization,
      eventLabels: {
        ...dashLocalization.eventLabels,
        ...options.localization?.eventLabels
      }
    },
    viewPaths: {
      settings: { activity: options.path ?? "activity" }
    }
  })
)
