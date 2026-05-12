import { useAuth, useSession } from "@better-auth-ui/solid"
import type { Component } from "solid-js"
import { createEffect, createMemo, Show } from "solid-js"
import type {
  SettingsPathViews,
  SettingsRouteResolution,
  SettingsSession
} from "@/components/auth/settings/shared/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type SettingsPanel = Component<{ session: SettingsSession }>

type SettingsRouteComponents = {
  account: SettingsPanel
  security: SettingsPanel
}

type SettingsShellProps = {
  activeRoute: SettingsRouteResolution
  class?: string
  currentView: string | undefined
  onTabChange: (nextView: string) => void
  routeComponents: SettingsRouteComponents
  session: SettingsSession
}

const settingsPathViews = () => {
  const auth = useAuth()

  return Object.fromEntries(
    Object.entries(auth.viewPaths.settings).map(([view, path]) => [path, view])
  ) as SettingsPathViews
}

export function createSettingsRouteResolver(
  routeComponents: SettingsRouteComponents
) {
  return function resolveSettingsRoute(path: string): SettingsRouteResolution {
    if (path === "account") {
      return { component: routeComponents.account, title: "Account" }
    }

    if (path === "security") {
      return { component: routeComponents.security, title: "Security" }
    }

    return { redirectTo: "/" }
  }
}

export function SettingsShell(props: SettingsShellProps) {
  const auth = useAuth()
  const AccountSettings = props.routeComponents.account
  const SecuritySettings = props.routeComponents.security

  return (
    <div class={cn("w-full gap-4 md:gap-6", props.class)}>
      <Show
        when={!props.session.isPending && props.session.data}
        fallback={
          <p class="text-sm text-muted-foreground">Loading settings…</p>
        }
      >
        <Show when={!("redirectTo" in props.activeRoute)}>
          <Tabs
            aria-label={auth.localization.settings.settings}
            class="w-full gap-4 md:gap-6"
            onChange={props.onTabChange}
            value={props.currentView}
          >
            <div>
              <TabsList aria-label={auth.localization.settings.settings}>
                <TabsTrigger value="account">
                  {auth.localization.settings.account}
                </TabsTrigger>
                <TabsTrigger value="security">
                  {auth.localization.settings.security}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent tabIndex={-1} value="account">
              <AccountSettings session={props.session} />
            </TabsContent>
            <TabsContent tabIndex={-1} value="security">
              <SecuritySettings session={props.session} />
            </TabsContent>
          </Tabs>
        </Show>
      </Show>
    </div>
  )
}

export function createSettingsComponent(
  routeComponents: SettingsRouteComponents
) {
  const resolveSettingsRoute = createSettingsRouteResolver(routeComponents)

  return function Settings(props: { class?: string; path: string }) {
    const auth = useAuth()
    const session = useSession(auth.authClient, {
      enabled: !import.meta.env.SSR
    })
    const currentView = createMemo(() => settingsPathViews()[props.path])
    const activeRoute = createMemo(() => resolveSettingsRoute(props.path))

    const handleSettingsTabChange = (nextView: string) => {
      if (nextView !== "account" && nextView !== "security") return

      auth.navigate({
        to: `${auth.basePaths.settings}/${auth.viewPaths.settings[nextView]}`
      })
    }

    createEffect(() => {
      if (import.meta.env.SSR || session.isPending || session.data) return

      const currentURL = window.location.pathname + window.location.search
      const redirectTo = encodeURIComponent(currentURL)

      auth.navigate({
        replace: true,
        to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}?redirectTo=${redirectTo}`
      })
    })

    return (
      <SettingsShell
        activeRoute={activeRoute()}
        class={props.class}
        currentView={currentView()}
        onTabChange={handleSettingsTabChange}
        routeComponents={routeComponents}
        session={session}
      />
    )
  }
}
