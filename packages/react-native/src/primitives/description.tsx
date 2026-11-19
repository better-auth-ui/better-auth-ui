import type { JSX, ReactNode } from "react"
import { cn } from "../lib/cn"
import { Txt } from "./styled"

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
}): JSX.Element {
  return <Txt className={cn("text-sm text-muted", className)}>{children}</Txt>
}
