import type { AnyAuthConfig } from "@better-auth-ui/react"
import { UserProfile } from "./user-profile"

export type SettingsProps = AnyAuthConfig & {
  className?: string
}

export function Settings({ className, ...config }: SettingsProps) {
  return (
    <div className={className}>
      <UserProfile {...config} />
    </div>
  )
}
