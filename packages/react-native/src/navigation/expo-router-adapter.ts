import {
  getNavigationPath,
  getNavigationParams,
  mergeRouteConfig,
  resolveNavigationTarget,
  type NavigationRouteConfig
} from "./route-config"
import { basePaths as defaultBasePaths } from "@better-auth-ui/core"
import {
  type AuthNavigateOptions,
  type Navigation,
  type PushTarget,
  toViewTarget
} from "./types"

/** Minimal shape of the object returned by expo-router's `useRouter()`. */
export interface ExpoRouterLike {
  push: (href: string) => void
  replace: (href: string) => void
  back?: () => void
}

export interface ExpoRouterNavigationOptions extends NavigationRouteConfig {
  /** The expo-router router (`useRouter()`). */
  router: ExpoRouterLike
  /** Result of usePathname(), used to preserve the current destination. */
  pathname?: string
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

  let routes: NavigationRouteConfig = {
    ...options,
    basePaths: {
      auth: authBasePath,
      settings: settingsBasePath,
      organization: organizationBasePath,
      ...options.basePaths
    },
    slugPrefix
  }

  const push = (next: PushTarget, opts?: AuthNavigateOptions) => {
    const target = toViewTarget(next)
    const redirectTo = params.redirectTo
    const inherited: Record<string, string> =
      target.section === "auth" && typeof redirectTo === "string"
        ? { redirectTo }
        : {}
    const href = getNavigationPath(target, routes, {
      ...inherited,
      ...opts?.params
    })
    if (opts?.replace) router.replace(href)
    else router.push(href)
  }

  return {
    push,
    configure: (config) => {
      routes = mergeRouteConfig(config, {
        ...options,
        basePaths: {
          ...options.basePaths,
          auth: options.authBasePath ?? options.basePaths?.auth,
          settings: options.settingsBasePath ?? options.basePaths?.settings,
          organization:
            options.organizationBasePath ?? options.basePaths?.organization
        }
      })
    },
    current: () =>
      options.pathname
        ? resolveNavigationTarget({ to: options.pathname }, routes)
        : undefined,
    getPath: (target) =>
      target
        ? getNavigationPath(target, routes)
        : options.pathname
          ? `${options.pathname}${
              Object.keys(params).length
                ? "?" +
                  Object.entries(params)
                    .filter(([, value]) => typeof value === "string")
                    .map(
                      ([key, value]) =>
                        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
                    )
                    .join("&")
                : ""
            }`
          : undefined,
    getParam: (key) => {
      const value = params[key]
      return Array.isArray(value) ? value[0] : value
    },
    navigate: (navOptions) => {
      const extra = getNavigationParams(navOptions.to, navOptions.params)
      const base = navOptions.to.split(/[?#]/)[0]
      const hash = navOptions.to.includes("#")
        ? `#${navOptions.to.split("#")[1]}`
        : ""
      const query = Object.entries(extra)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join("&")
      const to = `${base}${query ? `?${query}` : ""}${hash}`
      if (navOptions.replace) router.replace(to)
      else router.push(to)
    }
  }
}
