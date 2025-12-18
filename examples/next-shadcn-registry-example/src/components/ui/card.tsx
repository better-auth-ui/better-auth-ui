import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Renders a styled card container that merges default card styles with any provided classes.
 *
 * @param className - Additional CSS class names to merge with the card's default styles
 * @returns A `div` element used as the card root, with merged classes, `data-slot="card"`, and forwarded props
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the card header slot used to display header content inside a Card.
 *
 * @returns A div element with `data-slot="card-header"`, the component's layout and styling classes, and any forwarded props.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a container for a card title.
 *
 * @returns A `div` element used as the card title slot (`data-slot="card-title"`).
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * Renders a styled container for a card's description.
 *
 * @param className - Additional CSS class names to append to the component's default classes.
 * @returns A div element with the `data-slot="card-description"` attribute, merged classes, and any forwarded div props.
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * Renders a positioned container intended to hold card action elements.
 *
 * @returns A div element with `data-slot="card-action"` and layout classes that position content in the card's action slot.
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a container element used for card content.
 *
 * @returns A div element with the `data-slot="card-content"` attribute, base horizontal padding, merged `className`, and any forwarded props.
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * Renders the card footer slot used to host actions or supplementary content.
 *
 * @returns A div element with `data-slot="card-footer"` and layout classes for footer content
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}