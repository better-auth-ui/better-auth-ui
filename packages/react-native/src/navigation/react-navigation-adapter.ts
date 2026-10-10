import { type AuthView } from "@better-auth-ui/core"
import {
  getNavigationParams,
  getNavigationPath,
  mergeRouteConfig,
  resolveNavigationTarget,
  handleUnhandledNavigation,
  type NavigationRouteConfig
} from "./route-config"
import {
  type AuthNavigateOptions,
  type Navigation,
  type PushTarget,
  toViewTarget,
  type ViewTarget
} from "./types"

/** Minimal shape of a React Navigation `navigation` object. */
export interface ReactNavigationLike {
  navigate: (screen: string, params?: object) => void
  replace?: (screen: string, params?: object) => void
  goBack?: () => void
}

/** Screen-name map, one entry per section. */
export interface ReactNavigationScreens {
  auth: Partial<Record<AuthView, string>>
  admin?: Record<string, string>
  settings?: Record<string, string>
  organization?: Record<string, string>
}

export interface ReactNavigationOptions extends NavigationRouteConfig {
  /** The React Navigation `navigation` object (`useNavigation()`). */
  navigation: ReactNavigationLike
  /** Map each view (by section) to the screen name registered in your navigator. */
  screens: ReactNavigationScreens
  /** The current route (`useRoute()`) — powers `getParam`. */
  route?: { name?: string; params?: Record<string, unknown> }
}

function screenFor(
  screens: ReactNavigationScreens,
  target: ViewTarget
): string | undefined {
  if (target.section === "auth") return screens.auth[target.view]
  if (target.section === "settings") return screens.settings?.[target.view]
  if (target.section === "admin") return screens.admin?.[target.view]
  return screens.organization?.[target.view]
}

/**
 * Name-based navigation adapter for React Navigation. Navigates by screen name
 * (there is no URL), carrying `params` (and the org `slug`) through the navigator.
 *
 * ```tsx
 * const nav = createReactNavigationNavigation({
 *   navigation: useNavigation(),
 *   route: useRoute(),
 *   screens: { auth: { signIn: "SignIn", … }, settings: { account: "Account", … } }
 * })
 * ```
 */
export function createReactNavigationNavigation(
  options: ReactNavigationOptions
): Navigation {
  const { navigation, screens, route } = options
  let routes: NavigationRouteConfig = options

  const push = (next: PushTarget, opts?: AuthNavigateOptions) => {
    const target = toViewTarget(next)
    const screen = screenFor(screens, target)
    if (!screen)
      throw new Error(
        `[Better Auth UI] No screen is configured for ${target.section}.${target.view}`
      )
    const params = {
      ...(target.section === "auth" &&
      typeof route?.params?.redirectTo === "string"
        ? { redirectTo: route.params.redirectTo }
        : {}),
      ...opts?.params,
      ...(target.section === "organization" && target.slug
        ? { slug: target.slug }
        : {})
    }
    if (opts?.replace && navigation.replace) {
      navigation.replace(screen, params)
    } else {
      navigation.navigate(screen, params)
    }
  }

  return {
    push,
    configure: (config) => {
      routes = mergeRouteConfig(config, options)
    },
    current: () => {
      for (const section of [
        "auth",
        "settings",
        "admin",
        "organization"
      ] as const) {
        const entry = Object.entries(screens[section] ?? {}).find(
          ([, screen]) => screen === route?.name
        )
        if (!entry) continue
        if (section === "organization")
          return {
            section,
            view: entry[0],
            slug:
              typeof route?.params?.slug === "string"
                ? route.params.slug
                : undefined
          }
        if (section === "auth") return { section, view: entry[0] as AuthView }
        return { section, view: entry[0] }
      }
      return undefined
    },
    getPath: (target) => {
      if (target) return getNavigationPath(target, routes)
      for (const section of [
        "auth",
        "settings",
        "admin",
        "organization"
      ] as const) {
        const entry = Object.entries(screens[section] ?? {}).find(
          ([, screen]) => screen === route?.name
        )
        if (!entry) continue
        const params = Object.fromEntries(
          Object.entries(route?.params ?? {}).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string"
          )
        )
        return getNavigationPath(
          {
            section,
            view: entry[0],
            ...(section === "organization" ? { slug: params.slug } : {})
          } as ViewTarget,
          routes,
          params
        )
      }
      return undefined
    },
    getParam: (key) => {
      const value = route?.params?.[key]
      return typeof value === "string" ? value : undefined
    },
    navigate: (navOptions) => {
      const target = resolveNavigationTarget(navOptions, routes)
      if (!target) {
        handleUnhandledNavigation(navOptions, routes)
        return
      }
      push(target, {
        params: getNavigationParams(navOptions.to, navOptions.params),
        replace: navOptions.replace
      })
    }
  }
}
