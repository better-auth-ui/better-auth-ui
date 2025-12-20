import type { AnyAuthConfig } from "@better-auth-ui/react"
import { UserProfile } from "./user-profile"

export type AccountSettingsProps = AnyAuthConfig & {
  className?: string
}

export function AccountSettings({
  className,
  ...config
}: AccountSettingsProps) {
  return (
    <div className={className}>
      <UserProfile {...config} />
    </div>
  )
}
