import {
  basePaths as defaultBasePaths,
  viewPaths as defaultViewPaths,
  type SettingsView
} from "@better-auth-ui/core"
import {
  type AuthNavigateOptions,
  type Navigation,
  type PushTarget,
  toViewTarget,
  type ViewTarget
} from "./types"

/** Minimal shape of the object returned by expo-router's `useRouter()`. */
export interface ExpoRouterLike {
  push: (href: string) => void
  replace: (href: string) => void
  back?: () => void
}

export interface ExpoRouterNavigationOptions {
  /** The expo-router router (`useRouter()`). */
  router: ExpoRouterLike
  /** Result of `useLocalSearchParams()` — powers `getParam` (token, redirectTo, slug). */
  params?: Record<string, string | string[] | undefined>
  /** Base path for auth routes. @default `basePaths.auth` (`"/auth"`). */
  authBasePath?: string
  /** Base path for settings routes. @default `basePaths.settings`. */
  settingsBasePath?: string
  /** Base path for organization routes. @default `basePaths.organization`. */
  organizationBasePath?: string
  /** Prefix before the organization slug segment (e.g. `"@"`). @default `""`. */
  slugPrefix?: string
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
 * ```tsx
 * const router = useRouter()
 * const params = useLocalSearchParams()
 * const navigation = createExpoRouterNavigation({ router, params })
 * return <AuthProvider navigation={navigation} authClient={authClient}>…</AuthProvider>
 * ```
 */
export function createExpoRouterNavigation(
  options: ExpoRouterNavigationOptions
): Navigation {
  const {
    router,
    params = {},
    authBasePath = defaultBasePaths.auth,
    settingsBasePath = defaultBasePaths.settings,
    organizationBasePath = defaultBasePaths.organization,
    slugPrefix = ""
  } = options

  const settingsSegment = (view: SettingsView | string) =>
    (defaultViewPaths.settings as unknown as Record<string, string>)[view] ??
    view

  const pathFor = (target: ViewTarget, extra?: Record<string, string>) => {
    const query = buildQuery(extra)
    if (target.section === "auth") {
      return `${authBasePath}/${defaultViewPaths.auth[target.view]}${query}`
    }
    if (target.section === "settings") {
      return `${settingsBasePath}/${settingsSegment(target.view)}${query}`
    }
    const slugSeg = target.slug ? `/${slugPrefix}${target.slug}` : ""
    return `${organizationBasePath}${slugSeg}/${target.view}${query}`
  }

  const push = (next: PushTarget, opts?: AuthNavigateOptions) => {
    const href = pathFor(toViewTarget(next), opts?.params)
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
