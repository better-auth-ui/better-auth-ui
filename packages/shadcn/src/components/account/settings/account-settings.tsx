"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"

import { cn } from "@/lib/utils"
import { UserProfile } from "./user-profile"

export type AccountSettingsProps = AnyAuthConfig & {
  className?: string
}

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
