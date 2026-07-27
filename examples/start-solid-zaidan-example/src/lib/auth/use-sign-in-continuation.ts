import { useAuth } from "@better-auth-ui/solid"
import {
  isTwoFactorRedirect,
  storeTwoFactorMethods,
  TWO_FACTOR_PLUGIN_ID
} from "./two-factor-methods"

/**
 * Resolve what happens after a sign-in request succeeds.
 *
 * Better Auth withholds the session when a second factor is required and
 * answers with `{ twoFactorRedirect: true, twoFactorMethods }` instead, so no
 * sign-in strategy may navigate to `redirectTo` unconditionally. This is the
 * single place that decision lives — every password-based form calls it from
 * `onSuccess`.
 *
 * The enabled methods are stashed in session storage (names only, never a
 * code or token) and `redirectTo` rides along in the query string so the
 * challenge view can finish the original navigation.
 *
 * The two-factor plugin is looked up by its stable id, so sign-in forms stay
 * installable without either the two-factor components or a matching release
 * of `@better-auth-ui/core`.
 *
 * @returns A callback taking the resolved data of a sign-in mutation.
 */
export function useSignInContinuation() {
  const auth = useAuth()

  return (data: unknown) => {
    const twoFactorPath = auth.plugins.find(
      (plugin) => plugin.id === TWO_FACTOR_PLUGIN_ID
    )?.viewPaths?.auth?.twoFactor

    if (twoFactorPath && isTwoFactorRedirect(data)) {
      storeTwoFactorMethods(data.twoFactorMethods)

      auth.navigate({
        to: `${auth.basePaths.auth}/${twoFactorPath}?redirectTo=${encodeURIComponent(auth.redirectTo)}`
      })
      return
    }

    auth.navigate({ to: auth.redirectTo })
  }
}
