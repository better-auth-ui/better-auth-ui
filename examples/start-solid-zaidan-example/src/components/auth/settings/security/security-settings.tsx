import { useAuth } from "@better-auth-ui/solid"
import type { Component } from "solid-js"
import { Show } from "solid-js"
import { ActiveSessionsSettings } from "@/components/auth/settings/security/active-sessions-settings"
import { ChangePasswordSettings } from "@/components/auth/settings/security/change-password-settings"
import { LinkedAccountsSettings } from "@/components/auth/settings/security/linked-accounts-settings"
import { hasAuthPlugin } from "@/components/auth/settings/shared/helpers"
import type {
  SecurityCardsPlugin,
  SettingsSession
} from "@/components/auth/settings/shared/types"

type SecurityFeatureComponent = Component<{ session: SettingsSession }>

export type SecuritySettingsComponents = {
  apiKeys: SecurityFeatureComponent
  dangerZone: SecurityFeatureComponent
  passkeys: SecurityFeatureComponent
}

export function createSecuritySettingsComponent(
  components: SecuritySettingsComponents
) {
  return function SecuritySettings(props: { session: SettingsSession }) {
    const auth = useAuth()

    const ApiKeysSettings = components.apiKeys
    const PasskeysSettings = components.passkeys
    const DangerZoneSettings = components.dangerZone

    return (
      <div class="flex w-full flex-col gap-4 md:gap-6">
        <Show when={auth.emailAndPassword?.enabled}>
          <ChangePasswordSettings
            confirmPassword={auth.emailAndPassword.confirmPassword}
            session={props.session}
          />
        </Show>

        <Show when={!!auth.socialProviders?.length}>
          <LinkedAccountsSettings />
        </Show>

        <ActiveSessionsSettings session={props.session} />

        <Show when={hasAuthPlugin(auth.plugins, "apiKey")}>
          <ApiKeysSettings session={props.session} />
        </Show>

        <Show when={hasAuthPlugin(auth.plugins, "passkey")}>
          <PasskeysSettings session={props.session} />
        </Show>

        <Show when={hasAuthPlugin(auth.plugins, "deleteUser")}>
          <DangerZoneSettings session={props.session} />
        </Show>

        {auth.plugins.flatMap((plugin) => {
          const securityCards = plugin.securityCards as
            | SecurityCardsPlugin["securityCards"]
            | undefined

          return securityCards?.map((SecurityCard) => <SecurityCard />) ?? []
        })}
      </div>
    )
  }
}
