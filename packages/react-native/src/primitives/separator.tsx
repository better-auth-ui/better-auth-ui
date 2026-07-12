import { View } from "react-native"
import { cn } from "../lib/cn"

/**
 * Hairline divider. Used inside `FieldSeparator` flanking the "or" label.
 */
export function Separator({ className }: { className?: string }) {
  return <View className={cn("h-px bg-border", className)} />
}
