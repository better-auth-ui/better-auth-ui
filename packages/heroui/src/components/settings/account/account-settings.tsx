import type { AnyAuthConfig } from "@better-auth-ui/react"

import { cn } from "../../../lib/utils"
import { UserProfile } from "./user-profile"

export type AccountSettingsProps = AnyAuthConfig & {
  className?: string
}

/**
 * Renders the account settings layout and user profile UI.
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @param config - Auth-related props forwarded to the UserProfile component.
 * @returns A JSX element containing a styled container that renders the user profile.
 */
export function AccountSettings({
  className,
  ...config
}: AccountSettingsProps) {
  return (
    <div className={cn("w-full flex flex-col gap-4 md:gap-6", className)}>
      <UserProfile {...config} />
    </div>
  )
}
