import type { AdminView } from "@better-auth-ui/core"
import { adminPlugin as coreAdminPlugin } from "@better-auth-ui/core/plugins/admin"
import { useAuth, useAuthenticate } from "@better-auth-ui/solid"
import { For, Show } from "solid-js"
import { Dynamic } from "solid-js/web"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { AdminUsers } from "./admin-users"

export type AdminProps = {
  class?: string
  hideNav?: boolean
  path?: string
  view?: AdminView | string
}

/** Render a finite static administration route and plugin-contributed tabs. */
export function Admin(props: AdminProps) {
  const auth = useAuth()
  useAuthenticate(auth.authClient)
  const defaults = coreAdminPlugin()
  const config = () =>
    (auth.plugins.find((plugin) => plugin.id === coreAdminPlugin.id) ??
      defaults) as typeof defaults
  const tabs = () => auth.plugins.flatMap((plugin) => plugin.adminTabs ?? [])
  const currentView = () =>
    props.view ??
    (auth.viewPaths.admin.users === props.path ? "users" : undefined) ??
    tabs().find((tab) => tab.path === props.path)?.id
  const contribution = () => tabs().find((tab) => tab.id === currentView())

  if (!props.view && !props.path) {
    throw new Error("[Better Auth UI] Either `view` or `path` must be provided")
  }

  return (
    <div class={cn("flex w-full flex-col gap-6", props.class)}>
      <Show when={!props.hideNav}>
        <nav
          aria-label={config().localization.admin}
          class="flex gap-1 border-b"
        >
          <Button
            as="a"
            href={`${auth.basePaths.admin}/${auth.viewPaths.admin.users}`}
            variant={currentView() === "users" ? "secondary" : "ghost"}
          >
            {config().localization.users}
          </Button>
          <For each={tabs()}>
            {(tab) => (
              <Button
                as="a"
                href={`${auth.basePaths.admin}/${tab.path}`}
                variant={currentView() === tab.id ? "secondary" : "ghost"}
              >
                <Dynamic component={tab.label} />
              </Button>
            )}
          </For>
        </nav>
      </Show>

      <Show
        fallback={
          <Show
            fallback={
              <div class="flex min-h-64 flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-8 text-center">
                <h2 class="font-medium">{config().localization.unknownView}</h2>
                <p class="text-sm text-muted-foreground">
                  {config().localization.unknownViewDescription} &quot;
                  {props.path ?? props.view}&quot;
                </p>
              </div>
            }
            when={contribution()}
          >
            {(tab) => <Dynamic component={tab().component} />}
          </Show>
        }
        when={currentView() === "users"}
      >
        <AdminUsers />
      </Show>
    </div>
  )
}
