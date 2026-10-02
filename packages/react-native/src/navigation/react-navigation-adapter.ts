import {
  type AuthView,
  viewPaths as defaultViewPaths,
  type NavigateOptions,
  type SettingsView
} from "@better-auth-ui/core"
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
  auth: Record<AuthView, string>
  settings?: Record<string, string>
  organization?: Record<string, string>
}

export interface ReactNavigationOptions {
  /** The React Navigation `navigation` object (`useNavigation()`). */
  navigation: ReactNavigationLike
  /** Map each view (by section) to the screen name registered in your navigator. */
  screens: ReactNavigationScreens
  /** The current route (`useRoute()`) — powers `getParam`. */
  route?: { params?: Record<string, unknown> }
}

function resolveTarget(options: NavigateOptions): ViewTarget | undefined {
  if (options.view) return { section: "auth", view: options.view }
  const segment = options.to.split("?")[0].split("/").filter(Boolean).pop()
  if (!segment) return undefined
  const authEntry = (
    Object.entries(defaultViewPaths.auth) as [AuthView, string][]
  ).find(([, path]) => path === segment)
  if (authEntry) return { section: "auth", view: authEntry[0] }
  const settingsEntry = (
    Object.entries(defaultViewPaths.settings) as [SettingsView, string][]
  ).find(([, path]) => path === segment)
  if (settingsEntry) return { section: "settings", view: settingsEntry[0] }
  return undefined
}

function screenFor(
  screens: ReactNavigationScreens,
  target: ViewTarget
): string | undefined {
  if (target.section === "auth") return screens.auth[target.view]
  if (target.section === "settings") return screens.settings?.[target.view]
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

  const push = (next: PushTarget, opts?: AuthNavigateOptions) => {
    const target = toViewTarget(next)
    const screen = screenFor(screens, target)
    if (!screen) return
    const params = {
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
    current: () => undefined,
    getParam: (key) => {
      const value = route?.params?.[key]
      return typeof value === "string" ? value : undefined
    },
    navigate: (navOptions) => {
      const target = resolveTarget(navOptions)
      if (!target) return
      push(target, {
        params: navOptions.params,
        replace: navOptions.replace
      })
    }
  }
}
