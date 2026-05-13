import { useAuth, useSession } from "@better-auth-ui/solid"
import { createMemo, Show } from "solid-js"
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

const settingsPathViews = () => {
  const auth = useAuth()

  return Object.fromEntries(
    Object.entries(auth.viewPaths.settings).map(([view, path]) => [path, view])
  ) as SettingsPathViews
}

export function resolveSettingsRoute(path: string): SettingsRouteResolution {
  if (path === "account") {
    return { component: AccountSettings, title: "Account" }
  }

  if (path === "security") {
    return { component: SecuritySettings, title: "Security" }
  }

  return { redirectTo: "/" }
}

export function Settings(props: { class?: string; path: string }) {
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
              <AccountSettings />
            </TabsContent>
            <TabsContent tabIndex={-1} value="security">
              <SecuritySettings />
            </TabsContent>
          </Tabs>
        </Show>
      </Show>
    </div>
  )
}
