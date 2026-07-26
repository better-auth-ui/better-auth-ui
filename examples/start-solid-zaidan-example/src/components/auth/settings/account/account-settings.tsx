import { useAuth } from "@better-auth-ui/solid"
import type { Component } from "solid-js"
import { For, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
import { ChangeEmail } from "@/components/auth/settings/account/change-email"
import { UserProfile } from "@/components/auth/settings/account/user-profile"
import { cn } from "@/lib/utils"

export type AccountSettingsProps = {
  class?: string
}

type AccountCardPlugin = {
  id: string
  accountCards?: Component[]
  cardOverrides?: { account?: { changeEmail?: Component } }
}

export function AccountSettings(props: AccountSettingsProps = {}) {
  const auth = useAuth()
  const pluginAccountCards = () =>
    (auth.plugins as AccountCardPlugin[]).flatMap((plugin) =>
      (plugin.accountCards ?? []).map((AccountCard, index) => ({
        AccountCard,
        id: `${plugin.id}-${index.toString()}`
      }))
    )
  const changeEmailOverride = () =>
    (auth.plugins as AccountCardPlugin[]).find(
      (plugin) => plugin.cardOverrides?.account?.changeEmail
    )?.cardOverrides?.account?.changeEmail
  const ChangeEmailCard = () => changeEmailOverride() ?? ChangeEmail
  // A plugin that replaces the card brings its own way to confirm the change,
  // so it can stand on its own without password or magic-link auth.
  const showChangeEmail = () =>
    Boolean(
      auth.emailAndPassword?.enabled ||
        auth.plugins.some((plugin) => plugin.id === "magicLink") ||
        changeEmailOverride()
    )

  return (
    <div class={cn("flex w-full flex-col gap-4 md:gap-6", props.class)}>
      <UserProfile />

      <Show when={showChangeEmail()}>
        <Dynamic component={ChangeEmailCard()} />
      </Show>

      <For each={pluginAccountCards()}>
        {(item) => <Dynamic component={item.AccountCard} />}
      </For>
    </div>
  )
}
