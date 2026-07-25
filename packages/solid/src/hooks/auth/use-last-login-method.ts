import {
  type LastLoginMethodAuthClient,
  type LastLoginMethodLocalization,
  lastLoginMethodLocalization,
  lastLoginMethodPlugin
} from "@better-auth-ui/core/plugins/last-login-method"
import { type Accessor, createSignal, onMount } from "solid-js"
import { useAuth } from "../../lib/auth-provider"

export type LastLoginMethodState = {
  /** Most recently used method, such as `"email"`, `"google"`, or `"github"`. */
  method: Accessor<string | null>
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
  const auth = useAuth()
  const plugin = auth.plugins.find(
    (candidate) => candidate.id === lastLoginMethodPlugin.id
  )
  const localization = {
    ...lastLoginMethodLocalization,
    ...(plugin?.localization as
      | Partial<LastLoginMethodLocalization>
      | undefined)
  }
  const [method, setMethod] = createSignal<string | null>(null)

  onMount(() => {
    if (!plugin) return

    const client = auth.authClient as Partial<LastLoginMethodAuthClient>
    setMethod(client.getLastUsedLoginMethod?.() ?? null)
  })

  return { method, localization }
}
