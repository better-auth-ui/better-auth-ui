import type { AnyAuthConfig } from "@better-auth-ui/react"
import type { AccountView } from "@better-auth-ui/react/core"

import { useAuth } from "../../hooks/use-auth"
import { Settings } from "./settings/settings"

export type AccountProps = AnyAuthConfig & {
  className?: string
  path?: string
  view?: AccountView
}

/**
 * Selects and renders the appropriate account view component.
 *
 * @param path - Route path used to resolve an account view when `view` is not provided
 * @param view - Explicit auth view to render (e.g., "userProfile")
 */
export function Account({ className, view, path, ...config }: AccountProps) {
  const { viewPaths } = useAuth(config)

  if (!view && !path) {
    throw new Error("[Better Auth UI] Either `view` or `path` must be provided")
  }

  const accountPathViews = Object.fromEntries(
    Object.entries(viewPaths.account).map(([k, v]) => [v, k])
  ) as Record<string, AccountView>

  const currentView = view || (path ? accountPathViews[path] : undefined)

  switch (currentView) {
    case "settings":
      return <Settings {...config} />
    default:
      throw new Error(
        `[Better Auth UI] Valid views are: ${Object.keys(viewPaths.account).join(", ")}`
      )
  }
}
