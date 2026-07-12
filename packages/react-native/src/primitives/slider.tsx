import { type ComponentType, useMemo } from "react"
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

type NativeSliderProps = {
  value: number
  onValueChange?: (value: number) => void
  minimumValue?: number
  maximumValue?: number
  step?: number
  disabled?: boolean
  minimumTrackTintColor?: string
  maximumTrackTintColor?: string
  thumbTintColor?: string
}

/**
 * Resolve the optional native peer lazily, at render time — never at module
 * eval. The package barrel pulls this module in (additional-field → `<Auth/>`),
 * so a top-level `import "@react-native-community/slider"` would bind to a
 * native view at eval time and crash the whole app on import wherever that
 * native module isn't linked (e.g. Expo Go), even on screens with no slider.
 * The `require` sits in a try/catch so Metro treats it as an optional
 * dependency: if it's absent (or its native side is missing) we fall back to a
 * static track instead of throwing.
 */
function resolveNativeSlider(): ComponentType<NativeSliderProps> | null {
  try {
    return require("@react-native-community/slider").default
  } catch {
    return null
  }
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
  const RNSlider = useMemo(resolveNativeSlider, [])

  if (!RNSlider) {
    // Native module unavailable (e.g. Expo Go) — degrade to a static track.
    return (
      <View
        className={cn(
          "h-2 w-full rounded-full bg-surface-secondary",
          className
        )}
      />
    )
  }

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
