import { View } from "react-native"

import { Skeleton } from "../../../primitives/skeleton"

/**
 * Placeholder row matching {@link OrganizationInvitationRow} while
 * invitations load. Mirrors the heroui `OrganizationInvitationRowSkeleton`,
 * adapted for React Native: the `Table.Row`/`Table.Cell` grid becomes a
 * horizontally laid-out `View` row (no table primitive on RN), with each
 * cell's `Skeleton` block kept at the same size.
 */
export function OrganizationInvitationRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between gap-2">
      <Skeleton className="h-4 w-48 rounded-lg" />

      <Skeleton className="h-4 w-36 rounded-lg" />

      <Skeleton className="h-4 w-16 rounded-lg" />

      <Skeleton className="h-4 w-14 rounded-full" />
    </View>
  )
}
