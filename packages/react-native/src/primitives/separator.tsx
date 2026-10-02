import { cn } from "../lib/cn"
import { Box } from "./styled"

/**
 * Hairline divider. Used inside `FieldSeparator` flanking the "or" label.
 */
export function Separator({ className }: { className?: string }) {
  return <Box className={cn("h-px bg-border", className)} />
}
