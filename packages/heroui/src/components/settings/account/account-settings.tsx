import { type AnyAuthConfig, useAuth } from "@better-auth-ui/react"

import { cn } from "../../../lib/utils"
import { Accounts } from "./accounts"
import { UserProfile } from "./user-profile"

export type AccountSettingsProps = AnyAuthConfig & {
  className?: string
}

/**
 * Renders the account settings layout including user profile and accounts management.
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @param config - Auth-related props forwarded to the UserProfile and Accounts components.
 * @returns A JSX element containing a styled container that renders the user profile and accounts management.
 */
export function AccountSettings({
  className,
  ...config
}: AccountSettingsProps) {
  const { multiSession } = useAuth(config)

  return (
    <div className={cn("flex flex-col gap-4 md:gap-6", className)}>
      <UserProfile {...config} />

      {multiSession && <Accounts {...config} />}
    </div>
  )
}
