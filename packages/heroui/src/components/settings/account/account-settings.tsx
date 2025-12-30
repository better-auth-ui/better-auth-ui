import type { AnyAuthConfig } from "@better-auth-ui/react"

import { useAuth } from "../../../hooks/use-auth"
import { cn } from "../../../lib/utils"
import { Accounts } from "./accounts"
import { Appearance } from "./appearance"
import { ChangeEmail } from "./change-email"
import { UserProfile } from "./user-profile"

export type AccountSettingsProps = AnyAuthConfig & {
  className?: string
}

/**
 * Renders the account settings layout including user profile, change email, appearance, and accounts management.
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @param config - Auth-related props forwarded to the UserProfile, ChangeEmail, Appearance, and Accounts components.
 * @returns A JSX element containing a styled container that renders the user profile, change email, appearance, and accounts management.
 */
export function AccountSettings({
  className,
  ...config
}: AccountSettingsProps) {
  const { multiSession } = useAuth(config)

  return (
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className)}>
      <UserProfile {...config} />
      <ChangeEmail {...config} />
      <Appearance {...config} />

      {multiSession && <Accounts {...config} />}
    </div>
  )
}
