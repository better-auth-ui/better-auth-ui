import { useAuth } from "@better-auth-ui/react"
import type { LastLoginMethodAuthClient } from "@better-auth-ui/core/plugins/last-login-method"
import { lastLoginMethodPlugin } from "../../../lib/auth/last-login-method-plugin"
import { Txt } from "../../../primitives/styled"

export function LastUsedBadge({
  method,
  compact
}: {
  method: string | string[]
  compact?: boolean
}) {
  const { authClient, plugins } = useAuth()
  const plugin = plugins.find(
    (item) => item.id === lastLoginMethodPlugin.id
  ) as ReturnType<typeof lastLoginMethodPlugin> | undefined
  if (!plugin) return null
  const client = authClient as Partial<LastLoginMethodAuthClient> & {
    getCookie?: () => string
  }
  let last = plugin.getLastLoginMethod?.() ?? client.getLastUsedLoginMethod?.()
  if (!last) {
    const cookies = client.getCookie?.()?.split(";") ?? []
    const cookie = cookies
      .map((entry) => entry.trim())
      .find(
        (entry) =>
          entry.startsWith(`${plugin.cookieName}=`) ||
          entry.startsWith(`__Secure-${plugin.cookieName}=`)
      )
    const value = cookie?.slice(cookie.indexOf("=") + 1)
    if (value) {
      try {
        last = decodeURIComponent(value)
      } catch {
        last = value
      }
    }
  }
  if (!last || !(Array.isArray(method) ? method : [method]).includes(last))
    return null
  return (
    <Txt className="text-xs text-accent">
      {compact
        ? plugin.localization.lastUsedShort
        : plugin.localization.lastUsed}
    </Txt>
  )
}
