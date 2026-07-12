import RNSlider from "@react-native-community/slider"
import { View } from "react-native"
import { cn } from "../lib/cn"
import { useThemeColors } from "../lib/theme-colors"

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
 * A themed wrapper over `@react-native-community/slider` (an optional peer).
 * Used by additional-field `slider` inputs.
 */
export function Slider({
  value,
  onChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  isDisabled = false,
  className
}: SliderProps) {
  const colors = useThemeColors()
  return (
    <View className={cn("w-full", className)}>
      <RNSlider
        value={value}
        onValueChange={onChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        disabled={isDisabled}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.surfaceSecondary}
        thumbTintColor={colors.accent}
      />
    </View>
  )
}
