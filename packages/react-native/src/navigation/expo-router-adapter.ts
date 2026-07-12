import {
  type AuthView,
  basePaths as defaultBasePaths,
  viewPaths as defaultViewPaths
} from "@better-auth-ui/core"
import type { AuthNavigateOptions, AuthNavigation } from "./types"

/** Minimal shape of the object returned by expo-router's `useRouter()`. */
export interface ExpoRouterLike {
  push: (href: string) => void
  replace: (href: string) => void
  back?: () => void
}

export interface ExpoRouterNavigationOptions {
  /** The expo-router router (`useRouter()`). */
  router: ExpoRouterLike
  /** Result of `useLocalSearchParams()` — powers `getParam` (token, redirectTo). */
  params?: Record<string, string | string[] | undefined>
  /** Base path for auth routes. @default `basePaths.auth` (`"/auth"`). */
  authBasePath?: string
}

function buildQuery(params?: Record<string, string>): string {
  if (!params) return ""
  const entries = Object.entries(params)
  if (!entries.length) return ""
  // Built by hand: `URLSearchParams` is not reliably available under Hermes.
  return `?${entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&")}`
}

/**
 * Path-based navigation adapter for expo-router. Mirrors the web behaviour:
 * `navigate`/`push` compose a URL and hand it to `router.push`/`router.replace`.
 *
 * Wire it in your app layout:
 * ```tsx
 * const router = useRouter()
 * const params = useLocalSearchParams()
 * const navigation = createExpoRouterNavigation({ router, params })
 * return <AuthProvider navigation={navigation} authClient={authClient}>…</AuthProvider>
 * ```
 */
export function createExpoRouterNavigation(
  options: ExpoRouterNavigationOptions
): AuthNavigation {
  const { router, params = {}, authBasePath = defaultBasePaths.auth } = options

  const pathFor = (view: AuthView, extra?: Record<string, string>) =>
    `${authBasePath}/${defaultViewPaths.auth[view]}${buildQuery(extra)}`

  const push = (view: AuthView, opts?: AuthNavigateOptions) => {
    const href = pathFor(view, opts?.params)
    if (opts?.replace) router.replace(href)
    else router.push(href)
  }

  return {
    push,
    current: () => undefined,
    getParam: (key) => {
      const value = params[key]
      return Array.isArray(value) ? value[0] : value
    },
    navigate: ({ to, replace }) => {
      if (replace) router.replace(to)
      else router.push(to)
    }
  }
}
