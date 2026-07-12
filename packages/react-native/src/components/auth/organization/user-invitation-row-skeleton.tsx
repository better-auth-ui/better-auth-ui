import { View } from "react-native"
import { Skeleton } from "../../../primitives/skeleton"

/**
 * Placeholder row matching {@link UserInvitationRow} while invitations load.
 * Mirrors the heroui `UserInvitationRowSkeleton`, adapted for React Native:
 * `div`s become `View`s.
 */
export function UserInvitationRowSkeleton() {
  return (
    <View className="flex-row items-center gap-3">
      <Skeleton className="size-10 shrink-0 rounded-xl" />

      <View className="flex-col gap-1">
        <Skeleton className="h-4 w-40 rounded-lg" />
        <Skeleton className="h-3 w-28 rounded-lg" />
      </View>
    </View>
  )
}
