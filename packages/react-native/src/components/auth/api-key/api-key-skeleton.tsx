import { View } from "react-native"
import { Skeleton } from "../../../primitives/skeleton"

/**
 * Loading placeholder for a single API key row. Mirrors the heroui
 * `ApiKeySkeleton`, adapted for React Native: `div`s become `View`s and
 * flex classes are RN's row/column equivalents.
 */
export function ApiKeySkeleton() {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />

        <View className="flex-col gap-1">
          <Skeleton className="h-4 w-28 rounded-lg" />
          <Skeleton className="h-3 w-36 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-lg" />
        </View>
      </View>
    </View>
  )
}
