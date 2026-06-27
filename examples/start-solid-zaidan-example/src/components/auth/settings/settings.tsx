import type { SettingsView } from "@better-auth-ui/core"
import { useAuth, useSession } from "@better-auth-ui/solid"
import type { Component } from "solid-js"
import { createMemo, For, Show } from "solid-js"
import { AccountSettings } from "@/components/auth/settings/account/account-settings"
import { SecuritySettings } from "@/components/auth/settings/security/security-settings"
import type {
  SettingsPathViews,
  SettingsRouteResolution
} from "@/components/auth/settings/shared/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export { AccountSettings } from "@/components/auth/settings/account/account-settings"
export { SecuritySettings } from "@/components/auth/settings/security/security-settings"

type SettingsTabPlugin = {
  settingsTabs?: {
    view: string
    tabLabel: Component
    component: Component
  }[]
}

export type SettingsProps = {
  class?: string
  path?: string
  view?: SettingsView | string
  hideNav?: boolean
}

const settingsPathViews = () => {
  const auth = useAuth()

  const pluginEntries = (auth.plugins as SettingsTabPlugin[]).flatMap(
    (plugin) =>
      plugin.settingsTabs?.map((tab) => [tab.view, tab.view] as const) ?? []
  )

  return Object.fromEntries([
    ...Object.entries(auth.viewPaths.settings).map(([view, path]) => [
      path,
      view
    ]),
    ...pluginEntries
  ]) as SettingsPathViews
}

export function resolveSettingsRoute(
  path: string,
  pluginTabs: SettingsTabPlugin["settingsTabs"] = []
): SettingsRouteResolution {
  if (path === "account") {
    return { component: AccountSettings, title: "Account" }
  }

  if (path === "security") {
    return { component: SecuritySettings, title: "Security" }
  }

  const pluginTab = pluginTabs.find((tab) => tab.view === path)

  if (pluginTab) {
    return { component: pluginTab.component, title: pluginTab.view }
  }

  return { redirectTo: "/" }
}

export function resolveSettingsView(
  props: Pick<SettingsProps, "path" | "view">,
  pathViews: SettingsPathViews
) {
  const requestedView =
    props.view ?? (props.path ? pathViews[props.path] : undefined)

  return requestedView
}

export function Settings(props: SettingsProps) {
  const auth = useAuth()
  const session = useSession(auth.authClient, () => ({
    enabled: !import.meta.env.SSR
  }))
  const pluginTabs = createMemo(() =>
    (auth.plugins as SettingsTabPlugin[]).flatMap(
      (plugin) => plugin.settingsTabs ?? []
    )
  )
  const currentView = createMemo(
    () => resolveSettingsView(props, settingsPathViews()) ?? "account"
  )
  const activeRoute = createMemo(() =>
    resolveSettingsRoute(currentView(), pluginTabs())
  )

  const handleSettingsTabChange = (nextView: string) => {
    const path =
      auth.viewPaths.settings[nextView as SettingsView] ??
      pluginTabs().find((tab) => tab.view === nextView)?.view

    if (!path) return

    auth.navigate({
      to: `${auth.basePaths.settings}/${path}`
    })
  }

  return (
    <div class={cn("w-full gap-4 md:gap-6", props.class)}>
      <Show
        when={!session.isPending && session.data}
        fallback={
          <p class="text-sm text-muted-foreground">Loading settings…</p>
        }
      >
        <Show when={!("redirectTo" in activeRoute())}>
          <Tabs
            aria-label={auth.localization.settings.settings}
            class="w-full gap-4 md:gap-6"
            onChange={handleSettingsTabChange}
            value={currentView()}
          >
            <div class={cn(props.hideNav && "hidden")}>
              <TabsList aria-label={auth.localization.settings.settings}>
                <TabsTrigger value="account">
                  {auth.localization.settings.account}
                </TabsTrigger>
                <TabsTrigger value="security">
                  {auth.localization.settings.security}
                </TabsTrigger>
                <For each={pluginTabs()}>
                  {(tab) => (
                    <TabsTrigger value={tab.view}>
                      <tab.tabLabel />
                    </TabsTrigger>
                  )}
                </For>
              </TabsList>
            </div>

            <TabsContent tabIndex={-1} value="account">
              <AccountSettings />
            </TabsContent>
            <TabsContent tabIndex={-1} value="security">
              <SecuritySettings />
            </TabsContent>
            <For each={pluginTabs()}>
              {(tab) => (
                <TabsContent tabIndex={-1} value={tab.view}>
                  <tab.component />
                </TabsContent>
              )}
            </For>
          </Tabs>
        </Show>
      </Show>
    </div>
  )
}
