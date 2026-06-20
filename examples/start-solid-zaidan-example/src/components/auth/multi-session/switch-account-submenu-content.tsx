import {
  multiSessionPlugin as coreMultiSessionPlugin,
  type MultiSessionLocalization,
  multiSessionLocalization
} from "@better-auth-ui/core/plugins/multi-session"
import {
  listDeviceSessionsOptions,
  type MultiSessionAuthClient,
  useAuth,
  useSession
} from "@better-auth-ui/solid"
import { createQuery } from "@tanstack/solid-query"
import { Link } from "@tanstack/solid-router"
import { Check, CirclePlus } from "lucide-solid"
import { For, Show } from "solid-js"
import { shouldLoadDeviceSessions } from "@/components/auth/settings/shared/helpers"
import type { DeviceSession } from "@/components/auth/settings/shared/types"
import { UserView } from "@/components/auth/user/user-view"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { SwitchAccountSubmenuItem } from "./switch-account-submenu-item"

export function SwitchAccountSubmenuContent() {
  const auth = useAuth()
  const session = useSession(auth.authClient, {
    enabled: !import.meta.env.SSR
  })
  const userId = () => session.data?.user.id
  const multiSessionPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === coreMultiSessionPlugin.id)
  const multiSessionLabels = (): MultiSessionLocalization => ({
    ...multiSessionLocalization,
    ...(multiSessionPluginConfig()?.localization as
      | Partial<MultiSessionLocalization>
      | undefined)
  })
  const deviceSessions = createQuery(() => ({
    ...listDeviceSessionsOptions(
      auth.authClient as MultiSessionAuthClient,
      userId()
    ),
    enabled: shouldLoadDeviceSessions({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const otherDeviceSessions = () => {
    const sessions = (deviceSessions.data ?? []) as DeviceSession[]

    return sessions.filter(
      (deviceSession) => deviceSession.session.id !== session.data?.session.id
    )
  }

  return (
    <DropdownMenuSubContent class="min-w-48 max-w-[48svw] md:min-w-56">
      <DropdownMenuItem>
        <UserView
          isPending={deviceSessions.isPending}
          user={session.data?.user}
        />
        <Show when={!deviceSessions.isPending}>
          <Check class="ml-auto size-4" />
        </Show>
      </DropdownMenuItem>

      <For each={otherDeviceSessions()}>
        {(deviceSession) => (
          <SwitchAccountSubmenuItem deviceSession={deviceSession} />
        )}
      </For>

      <DropdownMenuSeparator />

      <DropdownMenuItem class="gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground">
        <Link
          class="flex w-full items-center gap-1.5"
          params={{ path: auth.viewPaths.auth.signIn }}
          to="/auth/$path"
        >
          <CirclePlus class="size-4 text-muted-foreground" />
          {multiSessionLabels().addAccount}
        </Link>
      </DropdownMenuItem>
    </DropdownMenuSubContent>
  )
}
