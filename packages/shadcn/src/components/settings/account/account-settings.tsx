"use client"

import { useAuth } from "@better-auth-ui/react"
import { cn } from "@/lib/utils"
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
 * UserProfile, ChangeEmail, and Appearance are always rendered; Accounts is rendered when `multiSession` is enabled.
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @returns The account settings container as a JSX element.
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
