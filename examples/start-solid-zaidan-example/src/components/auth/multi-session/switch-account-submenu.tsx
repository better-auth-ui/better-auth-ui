import {
  multiSessionPlugin as coreMultiSessionPlugin,
  type MultiSessionLocalization,
  multiSessionLocalization
} from "@better-auth-ui/core/plugins/multi-session"
import { useAuth, useSession } from "@better-auth-ui/solid"
import { ArrowLeftRight } from "lucide-solid"
import { Show } from "solid-js"
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu"
import { SwitchAccountSubmenuContent } from "./switch-account-submenu-content"

export type SwitchAccountSubmenuProps = {
  class?: string
}

export function SwitchAccountSubmenu(props: SwitchAccountSubmenuProps) {
  const auth = useAuth()
  const session = useSession(auth.authClient, () => ({
    enabled: !import.meta.env.SSR
  }))
  const multiSessionPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === coreMultiSessionPlugin.id)
  const multiSessionLabels = (): MultiSessionLocalization => ({
    ...multiSessionLocalization,
    ...(multiSessionPluginConfig()?.localization as
      | Partial<MultiSessionLocalization>
      | undefined)
  })

  return (
    <Show when={session.data}>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger class={props.class}>
          <ArrowLeftRight class="size-4 text-muted-foreground" />
          {multiSessionLabels().switchAccount}
        </DropdownMenuSubTrigger>

        <SwitchAccountSubmenuContent />
      </DropdownMenuSub>
    </Show>
  )
}
