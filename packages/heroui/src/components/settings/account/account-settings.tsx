import { useAuth } from "@better-auth-ui/react"

import { cn } from "../../../lib/utils"
import { Accounts } from "./accounts"
import { Appearance } from "./appearance"
import { ChangeEmail } from "./change-email"
import { UserProfile } from "./user-profile"

export type AccountSettingsProps = {
  className?: string
}

/**
 * Renders the account settings layout including user profile, change email, appearance, and accounts management.
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @returns A JSX element containing a styled container that renders the user profile, change email, appearance, and accounts management.
 */
export function AccountSettings({ className }: AccountSettingsProps) {
  const { multiSession } = useAuth()

  return (
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className)}>
      <UserProfile />
      <ChangeEmail />
      <Appearance />

      {multiSession && <Accounts />}
    </div>
  )
}
