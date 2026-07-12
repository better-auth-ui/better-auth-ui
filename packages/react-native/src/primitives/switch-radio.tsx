import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useRef
} from "react"
import { Animated, Pressable, Text, View } from "react-native"
import { cn } from "../lib/cn"
import { useThemeColors } from "../lib/theme-colors"

/* -------------------------------------------------------------------------
 * Switch
 * ---------------------------------------------------------------------- */

export interface SwitchProps {
  isSelected?: boolean
  onChange?: (selected: boolean) => void
  isDisabled?: boolean
  name?: string
  className?: string
  children?: ReactNode
}

/**
 * Controlled on/off switch mirroring heroui's `Switch.Content`/`.Control`/
 * `.Thumb` composition — a track+thumb `Pressable` (custom-styled rather than
 * RN's native `Switch`, to match the shared Card/Button/Checkbox visual
 * language) animating the thumb position and track color on toggle. Follows
 * the same controlled-prop shape as the `Checkbox` primitive.
 */
export function Switch({
  isSelected = false,
  onChange,
  isDisabled = false,
  className,
  children
}: SwitchProps) {
  const colors = useThemeColors()
  const progress = useRef(new Animated.Value(isSelected ? 1 : 0)).current

  Animated.timing(progress, {
    toValue: isSelected ? 1 : 0,
    duration: 150,
    useNativeDriver: false
  }).start()

  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceSecondary, colors.accent]
  })

  const thumbTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 18]
  })

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => onChange?.(!isSelected)}
      className={cn(
        "flex-row items-center gap-2",
        isDisabled && "opacity-50",
        className
      )}
    >
      <Animated.View
        style={{ backgroundColor: trackColor }}
        className="h-6 w-10 justify-center rounded-full"
      >
        <Animated.View
          style={{ transform: [{ translateX: thumbTranslate }] }}
          className="h-5 w-5 rounded-full bg-surface"
        />
      </Animated.View>

      {typeof children === "string" ? (
        <Text className="text-sm text-foreground">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  )
}

/** Text label slot for a `Switch`, for parity with heroui's `Switch.Content`. */
export function SwitchContent({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <View className={cn("flex-1", className)}>
      {typeof children === "string" ? (
        <Text className="text-sm text-foreground">{children}</Text>
      ) : (
        children
      )}
    </View>
  )
}

/* -------------------------------------------------------------------------
 * RadioGroup / Radio
 * ---------------------------------------------------------------------- */

export interface RadioGroupContextValue {
  value: string | undefined
  onChange: (value: string) => void
  isDisabled: boolean
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

/** Access the enclosing `RadioGroup` context (used by `Radio`). */
function useRadioGroup(): RadioGroupContextValue {
  const context = useContext(RadioGroupContext)
  if (!context) {
    throw new Error("[Better Auth UI] Radio must be used within a RadioGroup")
  }
  return context
}

export interface RadioGroupProps {
  value?: string
  onChange?: (value: string) => void
  isDisabled?: boolean
  className?: string
  children?: ReactNode
}

/**
 * Controlled radio group mirroring heroui's `RadioGroup` — owns the selected
 * value and exposes it via context to child `Radio`s. Only used once in the
 * heroui set (theme `Appearance` picker), but built as a general primitive.
 */
export function RadioGroup({
  value,
  onChange,
  isDisabled = false,
  className,
  children
}: RadioGroupProps) {
  const context = useMemo<RadioGroupContextValue>(
    () => ({
      value,
      onChange: (next: string) => onChange?.(next),
      isDisabled
    }),
    [value, onChange, isDisabled]
  )

  return (
    <RadioGroupContext.Provider value={context}>
      <View className={cn("gap-2", className)}>{children}</View>
    </RadioGroupContext.Provider>
  )
}

export interface RadioProps {
  value: string
  isDisabled?: boolean
  className?: string
  children?: ReactNode
}

/**
 * A single radio option within a `RadioGroup` — a circular control with an
 * inner dot when selected, following the same control/indicator/content slot
 * pattern as the `Checkbox` primitive.
 */
export function Radio({
  value,
  isDisabled: isItemDisabled = false,
  className,
  children
}: RadioProps) {
  const group = useRadioGroup()
  const isSelected = group.value === value
  const isDisabled = isItemDisabled || group.isDisabled

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => group.onChange(value)}
      className={cn(
        "flex-row items-center gap-2",
        isDisabled && "opacity-50",
        className
      )}
    >
      <RadioControl isSelected={isSelected} />

      {typeof children === "string" ? (
        <Text className="text-sm text-foreground">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  )
}

function RadioControl({ isSelected }: { isSelected: boolean }) {
  return (
    <View
      className={cn(
        "h-5 w-5 items-center justify-center rounded-full border",
        isSelected ? "border-accent" : "border-border"
      )}
    >
      {isSelected && <View className="h-2.5 w-2.5 rounded-full bg-accent" />}
    </View>
  )
}

/** Content slot for a `Radio`, for parity with heroui's `Radio.Content`. */
export function RadioContent({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return <View className={cn("flex-1 gap-1", className)}>{children}</View>
}
