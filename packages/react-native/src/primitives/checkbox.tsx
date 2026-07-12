import type { ReactNode } from "react"
import { Pressable, Text, View } from "react-native"
import { cn } from "../lib/cn"
import { Check } from "./ui-icons"

export interface CheckboxProps {
  isSelected?: boolean
  onChange?: (selected: boolean) => void
  isDisabled?: boolean
  name?: string
  className?: string
  children?: ReactNode
}

/**
 * Controlled checkbox with an inline label (sign-in "remember me"). Simplified
 * from heroui's `Checkbox.Content`/`.Control`/`.Indicator` composition — the RN
 * value is controlled, not read from form data.
 */
export function Checkbox({
  isSelected = false,
  onChange,
  isDisabled = false,
  className,
  children
}: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => onChange?.(!isSelected)}
      className={cn(
        "flex-row items-center gap-2",
        isDisabled && "opacity-50",
        className
      )}
    >
      <View
        className={cn(
          "h-5 w-5 items-center justify-center rounded border",
          isSelected
            ? "border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white"
            : "border-neutral-400 dark:border-neutral-600"
        )}
      >
        {isSelected && <Check width={14} height={14} color="#ffffff" />}
      </View>

      {typeof children === "string" ? (
        <Text className="text-sm text-neutral-800 dark:text-neutral-200">
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  )
}
