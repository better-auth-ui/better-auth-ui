import { View, type ViewProps } from "react-native"
import { cn } from "../lib/cn"

/**
 * Loading placeholder. Shape/size come from `className` (e.g. `rounded-full`,
 * `size-10`, `h-3.5 w-24`). Static muted block for the MVP.
 */
export function Skeleton({
  className,
  ...props
}: Omit<ViewProps, "style"> & { className?: string }) {
  return (
    <View
      className={cn("bg-surface-secondary opacity-80", className)}
      {...props}
    />
  )
}
