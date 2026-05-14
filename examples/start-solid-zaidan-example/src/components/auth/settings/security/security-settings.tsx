import { useAuth } from "@better-auth-ui/solid"
import { Show } from "solid-js"
import { ApiKeysSettings } from "@/components/auth/api-key/api-keys"
import { DangerZone } from "@/components/auth/delete-user/danger-zone"
import { PasskeysSettings } from "@/components/auth/passkey/passkeys"
import { ActiveSessionsSettings } from "@/components/auth/settings/security/active-sessions"
import { ChangePasswordSettings } from "@/components/auth/settings/security/change-password"
import { LinkedAccountsSettings } from "@/components/auth/settings/security/linked-accounts"
import { hasAuthPlugin } from "@/components/auth/settings/shared/helpers"
import type { SecurityCardsPlugin } from "@/components/auth/settings/shared/types"
import { cn } from "@/lib/utils"

export type SecuritySettingsProps = {
  class?: string
}

export function SecuritySettings(props: SecuritySettingsProps = {}) {
  const auth = useAuth()

  return (
    <div class={cn("flex w-full flex-col gap-4 md:gap-6", props.class)}>
      <Show when={auth.emailAndPassword?.enabled}>
        <ChangePasswordSettings
          confirmPassword={auth.emailAndPassword.confirmPassword}
        />
      </Show>

      <Show when={!!auth.socialProviders?.length}>
        <LinkedAccountsSettings />
      </Show>

      <ActiveSessionsSettings />

      <Show when={hasAuthPlugin(auth.plugins, "apiKey")}>
        <ApiKeysSettings />
      </Show>

      <Show when={hasAuthPlugin(auth.plugins, "passkey")}>
        <PasskeysSettings />
      </Show>

      <Show when={hasAuthPlugin(auth.plugins, "deleteUser")}>
        <DangerZone />
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
