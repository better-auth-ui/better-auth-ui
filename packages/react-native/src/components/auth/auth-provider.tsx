import { NativeAvatarContext } from "../../lib/native-avatar"
import {
  defaultNativeAvatarConfig,
  type NativeAvatarConfig
} from "../../lib/image"
import type { AuthClient, AuthView } from "@better-auth-ui/core"
import {
  useAuth,
  AuthProvider as AuthProviderPrimitive,
  type AuthProviderProps as AuthProviderPropsPrimitive
} from "@better-auth-ui/react"
import { useMemo } from "react"
import { AuthNavigationProvider } from "../../navigation/navigation-context"
import { resolveOrganizationPlugins } from "../../navigation/organization-plugins"
import { useStateNavigation } from "../../navigation/state-adapter"
import type { AuthNavigation } from "../../navigation/types"
import { NativeLocaleProvider } from "../../lib/native-locale"
import type { NavigationRouteConfig } from "../../navigation/route-config"
import { ToastHost } from "../../primitives/toast"
import { ReauthenticationProvider } from "./reauthentication"
import { ErrorToaster } from "./error-toaster"

export type AuthProviderProps<TAuthClient extends AuthClient = AuthClient> =
  Omit<AuthProviderPropsPrimitive<TAuthClient>, "navigate" | "avatar"> & {
    /**
     * Router adapter (expo-router / react-navigation). Omit it to use the
     * built-in state adapter — then `<Auth />` works with no router wiring.
     */
    avatar?: boolean | Partial<NativeAvatarConfig>
    navigation?: AuthNavigation
    /** Initial view for the default state adapter. @default "signIn" */
    initialView?: AuthView
    onUnhandledNavigate?: NavigationRouteConfig["onUnhandledNavigate"]
  }

/**
 * React Native `AuthProvider`. Wraps the framework-agnostic
 * `@better-auth-ui/react` provider, installs the navigation adapter (state
 * adapter by default), and mounts the `ErrorToaster` + toast host.
 */
export function AuthProvider<TAuthClient extends AuthClient = AuthClient>({
  children,
  avatar,
  navigation,
  initialView,
  onUnhandledNavigate,
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

  const nativeAvatar = useMemo(
    () => ({
      ...defaultNativeAvatarConfig,
      ...(typeof avatar === "object" ? avatar : {}),
      ...(typeof avatar === "boolean" ? { enabled: avatar } : {})
    }),
    [avatar]
  )
  return (
    <NativeAvatarContext.Provider value={nativeAvatar}>
      <AuthProviderPrimitive
        {...config}
        avatar={{
          enabled: nativeAvatar.enabled,
          size: nativeAvatar.size,
          extension: nativeAvatar.extension,
          delete: nativeAvatar.delete
        }}
        redirectTo={
          activeNavigation.getParam("redirectTo") ?? config.redirectTo
        }
        plugins={plugins}
        navigate={activeNavigation.navigate}
      >
        <NativeRuntime
          navigation={activeNavigation}
          onUnhandledNavigate={onUnhandledNavigate}
        >
          {children}
        </NativeRuntime>
      </AuthProviderPrimitive>
    </NativeAvatarContext.Provider>
  )
}

function NativeRuntime({
  navigation,
  onUnhandledNavigate,
  children
}: {
  navigation: AuthNavigation
  onUnhandledNavigate?: NavigationRouteConfig["onUnhandledNavigate"]
  children: React.ReactNode
}) {
  const { basePaths, viewPaths, baseURL, plugins, locale } = useAuth()
  const organization = plugins.find((plugin) => plugin.id === "organization")
  navigation.configure?.({
    basePaths,
    viewPaths: {
      auth: { ...viewPaths.auth },
      settings: { ...viewPaths.settings },
      admin: { ...viewPaths.admin },
      organization: {
        ...organization?.viewPaths?.organization,
        ...Object.fromEntries(
          plugins.flatMap(
            (plugin) =>
              plugin.organizationTabs?.map((tab) => [tab.id, tab.path]) ?? []
          )
        )
      }
    },
    baseURL,
    onUnhandledNavigate
  })
  return (
    <NativeLocaleProvider
      locale={{ ...locale, direction: locale.direction ?? "ltr" }}
    >
      <AuthNavigationProvider navigation={navigation}>
        <ReauthenticationProvider>
          {children}
          <ErrorToaster />
          <ToastHost />
        </ReauthenticationProvider>
      </AuthNavigationProvider>
    </NativeLocaleProvider>
  )
}
