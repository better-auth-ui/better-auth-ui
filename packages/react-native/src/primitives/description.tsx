import type { ReactNode } from "react"
import { Text } from "react-native"
import { cn } from "../lib/cn"

/**
 * Muted body / helper text. Can contain inline `Link` (which renders as an
 * inline pressable `Text`), e.g. the card footer prompt.
 */
export function Description({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return <Text className={cn("text-sm text-muted", className)}>{children}</Text>
}
