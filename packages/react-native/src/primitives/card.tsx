import type { ReactNode } from "react"
import { Text, View, type ViewProps } from "react-native"
import { cn } from "../lib/cn"

export type CardVariant =
  | "default"
  | "secondary"
  | "transparent"
  | (string & {})

export interface CardProps extends Omit<ViewProps, "style"> {
  variant?: CardVariant
  className?: string
  children?: ReactNode
}

function CardBase({ variant, className, children, ...props }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-2xl p-4",
        variant === "transparent"
          ? "bg-transparent"
          : "border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
        className
      )}
      {...props}
    >
      {children}
    </View>
  )
}

function CardHeader({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return <View className={cn(className)}>{children}</View>
}

function CardTitle({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <Text
      className={cn(
        "text-xl font-semibold text-neutral-900 dark:text-neutral-50",
        className
      )}
    >
      {children}
    </Text>
  )
}

function CardContent({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return <View className={cn(className)}>{children}</View>
}

function CardFooter({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return <View className={cn(className)}>{children}</View>
}

/**
 * Card container with `Header` / `Title` / `Content` / `Footer` slots, matching
 * the heroui `Card` composition. `variant="transparent"` drops the surface.
 */
export const Card = Object.assign(CardBase, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter
})
