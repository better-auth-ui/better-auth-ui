import type { ReactNode } from "react"
import { Text, View } from "react-native"
import { Separator } from "../../primitives/separator"

/**
 * A centered label flanked by two hairline separators (e.g. the "or" divider
 * between the form and the social buttons).
 */
export function FieldSeparator({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row items-center gap-4">
      <Separator className="flex-1" />

      <Text className="shrink-0 text-xs text-muted">{children}</Text>

      <Separator className="flex-1" />
    </View>
  )
}
