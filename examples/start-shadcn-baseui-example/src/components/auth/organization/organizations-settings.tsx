"use client"

import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { Organizations } from "./organizations"
import { UserInvitations } from "./user-invitations"

export type OrganizationsSettingsProps = {
  className?: string
}

/**
 * Renders the organizations settings panel.
 *
 * Displays all organizations the user belongs to with an empty state and
 * create button, followed by a card for invitations to the user.
 */
export function OrganizationsSettings({
  className,
  ...props
}: OrganizationsSettingsProps & ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full flex-col gap-4 md:gap-6", className)}
      {...props}
    >
      <Organizations />
      <UserInvitations />
    </div>
  )
}
