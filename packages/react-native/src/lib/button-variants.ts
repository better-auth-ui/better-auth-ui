import { cn } from "./cn"
import type { ThemeColorName } from "./theme-colors"

/**
 * Button visual variants as nativewind class strings, using the semantic theme
 * tokens (see `preset.js` / `theme.css`). Shared by the `Button` primitive and
 * by `Link` when it renders as a button.
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "ghost"
  | "danger"
  | "outline"

export type ButtonSize = "default" | "sm"

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-accent",
  secondary: "bg-surface-secondary",
  tertiary: "bg-transparent border border-border",
  outline: "bg-transparent border border-border",
  ghost: "bg-transparent",
  danger: "bg-danger"
}

const VARIANT_TEXT: Record<ButtonVariant, string> = {
  primary: "text-accent-foreground",
  secondary: "text-foreground",
  tertiary: "text-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  danger: "text-danger-foreground"
}

/** The theme-color token used for a variant's foreground (spinner/icon tint). */
export const VARIANT_FOREGROUND: Record<ButtonVariant, ThemeColorName> = {
  primary: "accentForeground",
  secondary: "foreground",
  tertiary: "foreground",
  outline: "foreground",
  ghost: "foreground",
  danger: "dangerForeground"
}

const SIZE_CONTAINER: Record<ButtonSize, string> = {
  default: "h-11 px-4",
  sm: "h-8 px-3"
}

const SIZE_TEXT: Record<ButtonSize, string> = {
  default: "text-base",
  sm: "text-sm"
}

/** Container (Pressable/View) classes for a button variant + size. */
export function buttonVariants({
  variant = "tertiary",
  size = "default",
  isIconOnly = false,
  disabled = false
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  isIconOnly?: boolean
  disabled?: boolean
} = {}): string {
  return cn(
    "flex-row items-center justify-center gap-2 rounded-lg",
    VARIANT_CONTAINER[variant],
    SIZE_CONTAINER[size],
    isIconOnly && (size === "sm" ? "w-8 px-0" : "w-11 px-0"),
    disabled && "opacity-50"
  )
}

/** Text (label) classes for a button variant + size. */
export function buttonTextVariants({
  variant = "tertiary",
  size = "default"
}: {
  variant?: ButtonVariant
  size?: ButtonSize
} = {}): string {
  return cn("font-medium", VARIANT_TEXT[variant], SIZE_TEXT[size])
}
