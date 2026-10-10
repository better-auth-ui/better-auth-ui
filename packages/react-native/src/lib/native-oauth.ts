import { Linking } from "react-native"
import type { Navigation } from "../navigation/types"

export function getNativeOAuthQuery(
  navigation: Navigation,
  supplied?: string
): string {
  return (
    supplied ??
    navigation.getParam("oauth_query") ??
    new URL(navigation.getPath?.() ?? "/", "https://better-auth.local").search
  )
}

/** Native callbacks must match the callback in the server-verified authorization request. */
export function resolveOAuthRedirect(value: string, query: string): string {
  const target = new URL(value)
  if (
    target.username ||
    target.password ||
    ["javascript:", "data:", "file:", "blob:", "about:"].includes(
      target.protocol
    )
  )
    throw new Error("Invalid OAuth redirect.")
  if (target.protocol === "https:" || target.protocol === "http:")
    return target.href
  const callbacks = new URLSearchParams(query).getAll("redirect_uri")
  if (callbacks.length !== 1) throw new Error("Missing OAuth callback.")
  const callback = new URL(callbacks[0]!)
  if (
    target.protocol !== callback.protocol ||
    target.host !== callback.host ||
    target.pathname !== callback.pathname
  )
    throw new Error("The OAuth redirect does not match the requested callback.")
  return target.href
}

export async function followOAuthRedirect(
  result: { url?: string },
  query: string
) {
  if (!result.url)
    throw new Error("The authorization server did not return a redirect.")
  await Linking.openURL(resolveOAuthRedirect(result.url, query))
}
