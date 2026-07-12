import type { Organization } from "better-auth/client"
import type { ReactNode } from "react"

import { cn } from "../../../lib/cn"
import { Avatar, type AvatarSize } from "../../../primitives/avatar"
import { Skeleton } from "../../../primitives/skeleton"
import { Briefcase } from "../../../primitives/ui-icons"

export type OrganizationLogoProps = {
  className?: string
  fallback?: ReactNode
  isPending?: boolean
  organization?: Partial<Organization>
  size?: AvatarSize
}

/**
 * Renders an organization logo image, initials fallback, or a briefcase icon;
 * shows a circular skeleton while loading when `isPending` is set and
 * `organization` is undefined. Mirrors the heroui `OrganizationLogo`, adapted
 * for React Native: the `Avatar`/`Skeleton` primitives render `View`/`Image`
 * instead of DOM elements, and `size` maps onto the shared RN `Avatar` sizes
 * (`"sm"`/`"md"`/`"lg"`) instead of heroui's `AvatarProps["size"]`.
 */
export function OrganizationLogo({
  className,
  fallback,
  isPending,
  organization,
  size = "sm"
}: OrganizationLogoProps) {
  if (isPending && !organization) {
    return (
      <Skeleton
        className={cn(
          "rounded-full",
          size === "sm" ? "size-8" : size === "md" ? "size-10" : "size-12",
          className
        )}
      />
    )
  }

  const initials = organization?.name?.slice(0, 2).toUpperCase()

  return (
    <Avatar size={size} className={cn("rounded-full", className)}>
      <Avatar.Image
        alt={organization?.name ?? "Organization"}
        src={organization?.logo ?? undefined}
      />

      <Avatar.Fallback delayMs={organization?.logo ? 600 : undefined}>
        {fallback || initials || (
          <Briefcase width={16} height={16} color="#525252" />
        )}
      </Avatar.Fallback>
    </Avatar>
  )
}
