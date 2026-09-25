import type { ReactNode } from "react"
import { cn } from "../lib/cn"
import { useThemeColors } from "../lib/theme-colors"
import { Box, Btn, Txt } from "./styled"
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
  const colors = useThemeColors()
  return (
    <Btn
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
      <Box
        className={cn(
          "h-5 w-5 items-center justify-center rounded border",
          isSelected ? "border-accent bg-accent" : "border-border"
        )}
      >
        {isSelected && (
          <Check width={14} height={14} color={colors.accentForeground} />
        )}
      </Box>

      {typeof children === "string" ? (
        <Txt className="text-sm text-foreground">{children}</Txt>
      ) : (
        children
      )}
    </Btn>
  )
}
