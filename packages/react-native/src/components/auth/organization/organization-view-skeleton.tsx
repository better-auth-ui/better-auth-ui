import { View } from "react-native"

import { cn } from "../../../lib/cn"
import { Skeleton } from "../../../primitives/skeleton"
import { OrganizationLogo } from "./organization-logo"
import type { OrganizationViewProps } from "./organization-view"

/**
 * Placeholder matching {@link OrganizationView} while organization data
 * loads. Mirrors the heroui `OrganizationViewSkeleton`, adapted for React
 * Native: `div`s become `View`s and sizing comes from `className` on the
 * shared `Skeleton` primitive.
 */
export function OrganizationViewSkeleton({
  className,
  hideSlug,
  size = "md"
}: OrganizationViewProps) {
  return (
    <View className={cn("flex-row min-w-0 items-center gap-2", className)}>
      <OrganizationLogo
        isPending
        className={size === "sm" ? "size-5" : undefined}
        size={size === "lg" ? "md" : "sm"}
      />

      <View className="flex-col min-w-0 gap-1">
        <Skeleton className="h-3.5 w-20 rounded-lg" />

        {!hideSlug && (
          <Skeleton className="h-3 w-28 rounded-lg mt-[0.5px] mb-0.5" />
        )}
      </View>
    </View>
  )
}
