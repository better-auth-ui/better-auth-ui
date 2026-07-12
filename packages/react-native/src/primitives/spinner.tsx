import { ActivityIndicator } from "react-native"
import { useThemeColors } from "../lib/theme-colors"
import { tw } from "../lib/tw"

export interface SpinnerProps {
  /** `"sm"` inside buttons; default otherwise. */
  size?: "sm" | "md"
  /**
   * Indicator color. `"current"` (the heroui convention for "inherit text
   * color") maps to the platform default, since React Native cannot inherit
   * color onto `ActivityIndicator`.
   */
  color?: string
  className?: string
}

/**
 * Loading spinner. Wraps `ActivityIndicator`; standalone use (e.g. sign-out)
 * and the odd inline case. Buttons render their own pending indicator.
 */
export function Spinner({ size = "md", color, className }: SpinnerProps) {
  const colors = useThemeColors()
  return (
    <ActivityIndicator
      size={size === "sm" ? 16 : 24}
      color={color && color !== "current" ? color : undefined}
      style={tw(className, colors)}
    />
  )
}
