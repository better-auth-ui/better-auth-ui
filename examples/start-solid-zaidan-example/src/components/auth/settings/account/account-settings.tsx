import { ManageAccounts } from "@/components/auth/multi-session/manage-accounts"
import { ChangeEmail } from "@/components/auth/settings/account/change-email"
import { UserProfile } from "@/components/auth/settings/account/user-profile"
import { AppearanceSettings } from "@/components/auth/theme/appearance"

export function AccountSettings() {
  return (
    <div class="flex w-full flex-col gap-4 md:gap-6">
      <UserProfile />

      <ChangeEmail />

      <AppearanceSettings />

      <ManageAccounts />
    </div>
  )
}
