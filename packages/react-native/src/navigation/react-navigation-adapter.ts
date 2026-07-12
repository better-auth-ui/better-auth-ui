import {
  type AuthView,
  viewPaths as defaultViewPaths,
  type NavigateOptions
} from "@better-auth-ui/core"
import type { AuthNavigateOptions, AuthNavigation } from "./types"

/** Minimal shape of a React Navigation `navigation` object. */
export interface ReactNavigationLike {
  navigate: (screen: string, params?: object) => void
  replace?: (screen: string, params?: object) => void
  goBack?: () => void
}

export interface ReactNavigationOptions {
  /** The React Navigation `navigation` object (`useNavigation()`). */
  navigation: ReactNavigationLike
  /** Map each auth view to the screen name registered in your navigator. */
  screens: Record<AuthView, string>
  /** The current route (`useRoute()`) — powers `getParam`. */
  route?: { params?: Record<string, unknown> }
}

function resolveView(options: NavigateOptions): AuthView | undefined {
  if (options.view) return options.view
  const segment = options.to.split("?")[0].split("/").filter(Boolean).pop()
  const entries = Object.entries(defaultViewPaths.auth) as [AuthView, string][]
  return entries.find(([, path]) => path === segment)?.[0]
}

/**
 * Name-based navigation adapter for React Navigation. Navigates by screen name
 * (there is no URL), carrying `params` through the navigator.
 *
 * ```tsx
 * const navigation = useNavigation()
 * const route = useRoute()
 * const nav = createReactNavigationNavigation({
 *   navigation,
 *   route,
 *   screens: { signIn: "SignIn", signUp: "SignUp", … }
 * })
 * return <AuthProvider navigation={nav} authClient={authClient}>…</AuthProvider>
 * ```
 */
export function createReactNavigationNavigation(
  options: ReactNavigationOptions
): AuthNavigation {
  const { navigation, screens, route } = options

  const push = (view: AuthView, opts?: AuthNavigateOptions) => {
    const screen = screens[view]
    if (opts?.replace && navigation.replace) {
      navigation.replace(screen, opts?.params)
    } else {
      navigation.navigate(screen, opts?.params)
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
      const view = resolveView(navOptions)
      if (!view) return
      push(view, {
        params: navOptions.params,
        replace: navOptions.replace
      })
    }
  }
}
