import type { AnyAuthConfig } from "@better-auth-ui/react"

import { useAuth } from "../../../hooks/use-auth"
import { cn } from "../../../lib/utils"
import { ChangePassword } from "./change-password"
import { ConnectedAccounts } from "./connected-accounts"
import { Sessions } from "./sessions"

export type SecuritySettingsProps = AnyAuthConfig & {
  className?: string
}

/**
 * Renders the security settings layout including password management, connected accounts, and active sessions.
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @param config - Auth-related props forwarded to the child components.
 * @returns A JSX element containing a styled container that renders the security settings.
 */
export function SecuritySettings({
  className,
  ...config
}: SecuritySettingsProps) {
  const { emailAndPassword, socialProviders } = useAuth(config)

  return (
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className)}>
      {emailAndPassword?.enabled && <ChangePassword {...config} />}
      {socialProviders?.length && <ConnectedAccounts {...config} />}
      <Sessions {...config} />
    </div>
  )
}
