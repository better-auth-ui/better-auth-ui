"use client"

import { useAuth } from "@better-auth-ui/react"

import { cn } from "@/lib/utils"
import { ChangePassword } from "./change-password"
import { ConnectedAccounts } from "./connected-accounts"

export type SecuritySettingsProps = {
  className?: string
}

/**
 * Renders the security settings layout including password management and connected accounts.
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @returns A JSX element containing a styled container that renders the security settings.
 */
export function SecuritySettings({ className }: SecuritySettingsProps) {
  const { emailAndPassword, socialProviders } = useAuth()

  return (
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className)}>
      {emailAndPassword?.enabled && <ChangePassword />}
      {socialProviders?.length && <ConnectedAccounts />}
    </div>
  )
}
