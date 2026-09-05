import { cn } from "../lib/cn"
import { Box } from "./styled"

export interface SliderProps {
  value: number
  onChange?: (value: number) => void
  minimumValue?: number
  maximumValue?: number
  step?: number
  isDisabled?: boolean
  className?: string
}

/**
 * Web fallback: `@react-native-community/slider` has no web implementation, so
 * on web (react-native-web) this renders a static track. Use on native for a
 * real, interactive slider.
 */
export function Slider({ className }: SliderProps) {
  return (
    <Box
      className={cn("h-2 w-full rounded-full bg-surface-secondary", className)}
    />
  )
}
