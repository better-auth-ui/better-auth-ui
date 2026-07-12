import { cn } from "./cn"

/**
 * Button visual variants, expressed as nativewind class strings. Shared by the
 * `Button` primitive and by `Link` when it renders as a button (mirrors the web
 * `buttonVariants` helper from `@heroui/styles`).
 *
 * The primitives own the visual theme with concrete Tailwind colors so that
 * component ports only ever pass structural/layout classes.
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "ghost"
  | "danger"

export type ButtonSize = "default" | "sm"

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-neutral-900 dark:bg-white",
  secondary: "bg-neutral-100 dark:bg-neutral-800",
  tertiary: "bg-transparent border border-neutral-300 dark:border-neutral-700",
  ghost: "bg-transparent",
  danger: "bg-red-600"
}

const VARIANT_TEXT: Record<ButtonVariant, string> = {
  primary: "text-white dark:text-neutral-900",
  secondary: "text-neutral-900 dark:text-neutral-50",
  tertiary: "text-neutral-900 dark:text-neutral-50",
  ghost: "text-neutral-900 dark:text-neutral-50",
  danger: "text-white"
}

const SIZE_CONTAINER: Record<ButtonSize, string> = {
  default: "h-11 px-4",
  sm: "h-8 px-3"
}

const SIZE_TEXT: Record<ButtonSize, string> = {
  default: "text-base",
  sm: "text-sm"
}

/**
 * Container (Pressable/View) classes for a button variant + size.
 */
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

/**
 * Text (label) classes for a button variant + size.
 */
export function buttonTextVariants({
  variant = "tertiary",
  size = "default"
}: {
  variant?: ButtonVariant
  size?: ButtonSize
} = {}): string {
  return cn("font-medium", VARIANT_TEXT[variant], SIZE_TEXT[size])
}
