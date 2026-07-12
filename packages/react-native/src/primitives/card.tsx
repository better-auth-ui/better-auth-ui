import type { ReactNode } from "react"
import type { ViewProps } from "react-native"
import { cn } from "../lib/cn"
import { Box, Txt } from "./styled"

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
    <Box
      className={cn(
        "rounded-2xl p-4",
        variant === "transparent"
          ? "bg-transparent"
          : "border border-border bg-surface",
        className
      )}
      {...props}
    >
      {children}
    </Box>
  )
}

function CardHeader({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return <Box className={cn(className)}>{children}</Box>
}

function CardTitle({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <Txt className={cn("text-xl font-semibold text-foreground", className)}>
      {children}
    </Txt>
  )
}

function CardContent({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return <Box className={cn(className)}>{children}</Box>
}

function CardFooter({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return <Box className={cn(className)}>{children}</Box>
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
