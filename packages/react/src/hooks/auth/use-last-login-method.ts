"use client"

import {
  type LastLoginMethodAuthClient,
  type LastLoginMethodLocalization,
  lastLoginMethodLocalization,
  lastLoginMethodPlugin
} from "@better-auth-ui/core/plugins/last-login-method"
import { useCallback, useSyncExternalStore } from "react"
import { useAuth } from "../../components/auth/auth-provider"

const subscribe = () => () => {}
const getServerSnapshot = () => null

export type LastLoginMethodState = {
  /** Most recently used method, such as `"email"`, `"google"`, or `"github"`. */
  method: string | null
  /** Localization contributed by `lastLoginMethodPlugin()`. */
  localization: LastLoginMethodLocalization
}

/**
 * Reads Better Auth's last-login-method cookie after hydration.
 *
 * Always returns an object containing `method` and `localization`. Only
 * `method` is `null` when the UI plugin is not registered or the matching
 * Better Auth client plugin has no stored method.
 */
export function useLastLoginMethod(): LastLoginMethodState {
  const { authClient, plugins } = useAuth()
  const plugin = plugins.find(
    (candidate) => candidate.id === lastLoginMethodPlugin.id
  )
  const localization = {
    ...lastLoginMethodLocalization,
    ...(plugin?.localization as
      | Partial<LastLoginMethodLocalization>
      | undefined)
  }

  const getSnapshot = useCallback(() => {
    if (!plugin) return null

    const client = authClient as Partial<LastLoginMethodAuthClient>
    return client.getLastUsedLoginMethod?.() ?? null
  }, [authClient, plugin])

  const method = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return { method, localization }
}
