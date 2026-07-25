"use client"

import {
  type LastLoginMethodLocalization,
  lastLoginMethodLocalization,
  lastLoginMethodPlugin
} from "@better-auth-ui/core/plugins"
import { useCallback, useSyncExternalStore } from "react"
import { useAuth } from "../../components/auth/auth-provider"
import type { LastLoginMethodAuthClient } from "../../lib/auth-client"

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
 * Returns `null` until `lastLoginMethodPlugin()` is registered and the
 * matching Better Auth client plugin has a stored method.
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
