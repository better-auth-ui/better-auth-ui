import { Children, type ReactNode } from "react"
import {
  ActivityIndicator,
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  Text
} from "react-native"
import {
  type ButtonSize,
  type ButtonVariant,
  buttonTextVariants,
  buttonVariants,
  VARIANT_FOREGROUND
} from "../lib/button-variants"
import { cn } from "../lib/cn"
import { useThemeColors } from "../lib/theme-colors"
import { useForm } from "./form"

export interface ButtonProps
  extends Omit<PressableProps, "children" | "disabled" | "style"> {
  variant?: ButtonVariant
  size?: ButtonSize
  isPending?: boolean
  isDisabled?: boolean
  isIconOnly?: boolean
  /** Accepted for parity with the web API; RN drives form submit manually. */
  type?: "button" | "submit"
  className?: string
  textClassName?: string
  "aria-label"?: string
  children?: ReactNode
}

/**
 * Pressable button. Mirrors the heroui `Button` surface used by the MVP:
 * `variant`, `size`, `isPending`, `isIconOnly`, `isDisabled`, `onPress`,
 * `aria-label`. When pending it renders its own leading indicator (so ports
 * don't need the inline `<Spinner/>` child). String children are auto-wrapped
 * in a styled `Text` (RN cannot render bare strings).
 */
export function Button({
  variant = "tertiary",
  size = "default",
  isPending = false,
  isDisabled = false,
  isIconOnly = false,
  type,
  className,
  textClassName,
  onPress,
  children,
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) {
  const disabled = isDisabled || isPending
  const form = useForm()
  const colors = useThemeColors()

  // A `type="submit"` button with no explicit handler drives the enclosing
  // Form (validate all fields, then run its onSubmit) — the RN stand-in for a
  // native form submit.
  const handlePress = (event: GestureResponderEvent) => {
    if (onPress) {
      onPress(event)
      return
    }
    if (type === "submit") form?.submit()
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ariaLabel}
      accessibilityState={{ disabled, busy: isPending }}
      disabled={disabled}
      onPress={handlePress}
      className={cn(
        buttonVariants({ variant, size, isIconOnly, disabled }),
        className
      )}
      {...props}
    >
      {isPending && (
        <ActivityIndicator
          size="small"
          color={colors[VARIANT_FOREGROUND[variant]]}
        />
      )}

      {Children.map(children, (child) =>
        typeof child === "string" || typeof child === "number" ? (
          <Text
            className={cn(buttonTextVariants({ variant, size }), textClassName)}
          >
            {child}
          </Text>
        ) : (
          child
        )
      )}
    </Pressable>
  )
}
