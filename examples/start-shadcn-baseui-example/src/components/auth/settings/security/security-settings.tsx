"use client"

import { useAuth } from "@better-auth-ui/react"
import { cn } from "@/lib/utils"
import { ActiveSessions } from "./active-sessions"
import { ChangePassword } from "./change-password"
import { LinkedAccounts } from "./linked-accounts"

export type SecuritySettingsProps = {
  className?: string
}

/**
 * Renders the security settings layout including password management, linked accounts, and active sessions.
 *
 * ChangePassword is rendered when password authentication is enabled; LinkedAccounts is rendered when social providers are present.
 * Each registered auth plugin may contribute `securityCards` (for example passkeys, delete-user).
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @returns The security settings container as a JSX element.
 */
export function SecuritySettings({ className }: SecuritySettingsProps) {
  const { emailAndPassword, plugins, socialProviders } = useAuth()

  return (
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className)}>
      {emailAndPassword?.enabled && <ChangePassword />}
      {!!socialProviders?.length && <LinkedAccounts />}
      <ActiveSessions />
      {plugins.flatMap(
        (plugin) =>
          plugin.securityCards?.map((Card, index) => (
            <Card key={`${plugin.id}-${index.toString()}`} />
          )) ?? []
      )}
    </div>
  )
}
