import type { ReactNode } from "react"
import { Separator } from "../../primitives/separator"
import { Box, Txt } from "../../primitives/styled"

/**
 * A centered label flanked by two hairline separators (e.g. the "or" divider
 * between the form and the social buttons).
 */
export function FieldSeparator({ children }: { children: ReactNode }) {
  return (
    <Box className="flex-row items-center gap-4">
      <Separator className="flex-1" />

      <Txt className="shrink-0 text-xs text-muted">{children}</Txt>

      <Separator className="flex-1" />
    </Box>
  )
}
