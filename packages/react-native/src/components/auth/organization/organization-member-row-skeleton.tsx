import { View } from "react-native"

import { Skeleton } from "../../../primitives/skeleton"
import { UserView } from "../user/user-view"

/**
 * Placeholder row matching `OrganizationMemberRow` while members load.
 */
export function OrganizationMemberRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between gap-2">
      <UserView isPending />

      <Skeleton className="h-4 w-18 rounded-lg" />

      <Skeleton className="size-8 rounded-full" />
    </View>
  )
}
