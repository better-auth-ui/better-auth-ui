"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"

import { cn } from "@/lib/utils"
import { UserProfile } from "./user-profile"

export type AccountSettingsProps = AnyAuthConfig & {
  className?: string
}

/**
 * Renders the account settings layout and forwards auth configuration props to the contained UserProfile.
 *
 * @returns A React element that renders a layout wrapper and a UserProfile configured with the component props.
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
