import { View } from "react-native"

import { Skeleton } from "../../../primitives/skeleton"

/**
 * Placeholder matching {@link DeleteOrganization} while the delete permission resolves.
 */
export function DeleteOrganizationSkeleton() {
  return (
    <View className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <View className="flex-col gap-1">
        <Skeleton className="h-3.5 w-40 rounded-lg" />
        <Skeleton className="h-3 w-64 rounded-lg" />
      </View>

      <Skeleton className="h-8 w-36 shrink-0 rounded-full" />
    </View>
  )
}
