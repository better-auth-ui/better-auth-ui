import { useAuth } from "@better-auth-ui/react"
import type { CardProps } from "@heroui/react"
import type { ComponentProps } from "react"
import { cn } from "../../../lib/utils"
import { ActiveSessions } from "./active-sessions"
import { ChangePassword } from "./change-password"
import { ConnectedAccounts } from "./connected-accounts"

export type SecuritySettingsProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Renders the security settings layout including password management, connected accounts, and active sessions.
 *
 * ChangePassword is rendered when password authentication is enabled; ConnectedAccounts is rendered when social providers are present.
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @returns The security settings container as a JSX element.
 */
export function SecuritySettings({
  className,
  ...props
}: SecuritySettingsProps & ComponentProps<"div">) {
  const { emailAndPassword, socialProviders } = useAuth()

  return (
    <div
      className={cn("flex w-full flex-col gap-4 md:gap-6", className)}
      {...props}
    >
      {emailAndPassword?.enabled && <ChangePassword />}
      {socialProviders?.length && <ConnectedAccounts />}
      <ActiveSessions />
    </div>
  )
}
