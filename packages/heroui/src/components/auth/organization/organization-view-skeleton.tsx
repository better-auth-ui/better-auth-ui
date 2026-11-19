import { cn, Skeleton } from "@heroui/react"
import type { ComponentProps, JSX } from "react"

import { OrganizationLogo } from "./organization-logo"
import type { OrganizationViewProps } from "./organization-view"

/**
 * Placeholder matching {@link OrganizationView} while organization data loads.
 */
export function OrganizationViewSkeleton({
  className,
  hideSlug,
  size = "md",
  ...props
}: OrganizationViewProps & ComponentProps<"div">): JSX.Element {
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
        <Skeleton className="h-3.5 w-20 rounded-lg" />

        {!hideSlug && (
          <Skeleton className="h-3 w-28 rounded-lg mt-[0.5px] mb-0.5" />
        )}
      </div>
    </div>
  )
}
