import { ManageAccounts } from "@/components/auth/multi-session/manage-accounts"
import { ChangeEmail } from "@/components/auth/settings/account/change-email"
import { UserProfile } from "@/components/auth/settings/account/user-profile"
import { AppearanceSettings } from "@/components/auth/theme/appearance"
import { cn } from "@/lib/utils"

export type AccountSettingsProps = {
  class?: string
}

export function AccountSettings(props: AccountSettingsProps = {}) {
  return (
    <div class={cn("flex w-full flex-col gap-4 md:gap-6", props.class)}>
      <UserProfile />

      <ChangeEmail />

      <AppearanceSettings />

      <ManageAccounts />
    </div>
  )
}
