"use client"

import type { ComponentProps } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  OrganizationLogo,
  type OrganizationLogoSize
} from "./organization-logo"

export type OrganizationViewSkeletonProps = {
  className?: string
  hideSlug?: boolean
  size?: OrganizationLogoSize
}

/**
 * Placeholder matching `OrganizationView` while organization data loads.
 */
export function OrganizationViewSkeleton({
  className,
  hideSlug,
  size = "md",
  ...props
}: OrganizationViewSkeletonProps & ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-w-0 items-center gap-2", className)}
      {...props}
    >
      <OrganizationLogo
        isPending
        className={size === "sm" ? "size-5" : undefined}
        size={size === "lg" ? "md" : "sm"}
      />

      <div className="flex flex-col min-w-0 gap-1">
        <Skeleton className="h-3.5 w-20 rounded-md" />

        {!hideSlug && <Skeleton className="h-3 w-28 rounded-md" />}
      </div>
    </div>
  )
}
