import type { AnyAuthConfig } from "@better-auth-ui/react"
import { useHydrated } from "../use-hydrated"
import { useAuth } from "./use-auth"

/**
 * Reads and validates the `redirectTo` query parameter from the URL to prevent open redirect vulnerabilities.
 *
 * When the app is hydrated, reads the `redirectTo` query parameter and validates it:
 * - Must be a relative path starting with "/" but not "//"
 * - Must not contain a scheme (e.g., "://")
 * - Must not contain backslashes (browsers can normalize "\" to "/" making "/\evil.com" become "//evil.com")
 *
 * @returns The validated redirect path, or `undefined` if not present or invalid
 */
export function useRedirectTo(config?: AnyAuthConfig) {
  const { redirectTo } = useAuth(config)
  const hydrated = useHydrated()

  // Validate redirectTo from URL search params to prevent open redirect vulnerabilities
  if (hydrated) {
    const redirectToParam = new URLSearchParams(window.location.search)
      .get("redirectTo")
      ?.trim()

    if (redirectToParam) {
      // Validate: must be a relative path starting with "/" but not "//"
      // and must not contain a scheme (e.g., "://") or backslashes
      // (browsers can normalize "\" to "/" making "/\evil.com" become "//evil.com")
      const isValidRedirect =
        redirectToParam.startsWith("/") &&
        !redirectToParam.startsWith("//") &&
        !redirectToParam.includes("://") &&
        !redirectToParam.includes("\\")

      if (isValidRedirect) {
        return redirectToParam
      }
    }
  }

  return redirectTo
}
