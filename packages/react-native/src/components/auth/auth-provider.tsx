import type { AuthClient, AuthView } from "@better-auth-ui/core"
import {
  AuthProvider as AuthProviderPrimitive,
  type AuthProviderProps as AuthProviderPropsPrimitive
} from "@better-auth-ui/react"
import { useMemo } from "react"
import { AuthNavigationProvider } from "../../navigation/navigation-context"
import { resolveOrganizationPlugins } from "../../navigation/organization-plugins"
import { useStateNavigation } from "../../navigation/state-adapter"
import type { AuthNavigation } from "../../navigation/types"
import { ToastHost } from "../../primitives/toast"
import { ErrorToaster } from "./error-toaster"

export type AuthProviderProps<TAuthClient extends AuthClient = AuthClient> =
  Omit<AuthProviderPropsPrimitive<TAuthClient>, "navigate"> & {
    /**
     * Router adapter (expo-router / react-navigation). Omit it to use the
     * built-in state adapter — then `<Auth />` works with no router wiring.
     */
    navigation?: AuthNavigation
    /** Initial view for the default state adapter. @default "signIn" */
    initialView?: AuthView
  }

/**
 * React Native `AuthProvider`. Wraps the framework-agnostic
 * `@better-auth-ui/react` provider, installs the navigation adapter (state
 * adapter by default), and mounts the `ErrorToaster` + toast host.
 */
export function AuthProvider<TAuthClient extends AuthClient = AuthClient>({
  children,
  navigation,
  initialView,
  ...config
}: AuthProviderProps<TAuthClient>) {
  // Always create the state adapter (cheap); used only when no adapter is passed.
  const stateNavigation = useStateNavigation(initialView)
  const activeNavigation = navigation ?? stateNavigation

  const current = activeNavigation.current()
  const routeSlug =
    current?.section === "organization"
      ? current.slug
      : activeNavigation.getParam("slug")
  const plugins = useMemo(
    () => resolveOrganizationPlugins(config.plugins, routeSlug),
    [config.plugins, routeSlug]
  )

  return (
    <AuthProviderPrimitive
      {...config}
      plugins={plugins}
      navigate={activeNavigation.navigate}
    >
      <AuthNavigationProvider navigation={activeNavigation}>
        {children}

        <ErrorToaster />
        <ToastHost />
      </AuthNavigationProvider>
    </AuthProviderPrimitive>
  )
}
