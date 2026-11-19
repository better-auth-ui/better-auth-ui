import { type CardProps, cn } from "@heroui/react"
import type { ComponentProps, JSX } from "react"

import { Organizations } from "./organizations"
import { UserInvitations } from "./user-invitations"

export type OrganizationsSettingsProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Renders the organizations settings panel.
 *
 * Displays all organizations the user belongs to with an empty state and
 * create button, followed by a card for invitations to the user.
 *
 * @param className - Optional additional CSS class names for the outer container.
 * @param variant - Card variant forwarded to each card.
 * @returns The organizations settings UI as a JSX element.
 */
export function OrganizationsSettings({
  className,
  variant,
  ...props
}: OrganizationsSettingsProps & ComponentProps<"div">): JSX.Element {
  return (
    <div
      className={cn("flex w-full flex-col gap-4 md:gap-6", className)}
      {...props}
    >
      <Organizations variant={variant} />
      <UserInvitations variant={variant} />
    </div>
  )
}
