"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * Renders a styled separator element with configurable orientation and decorative accessibility.
 *
 * @param className - Additional CSS classes to apply to the separator
 * @param orientation - Separator orientation, either `"horizontal"` or `"vertical"`. Defaults to `"horizontal"`.
 * @param decorative - Whether the separator is decorative for accessibility purposes. Defaults to `true`.
 * @param props - Extra props are forwarded to the underlying `SeparatorPrimitive.Root`
 * @returns The rendered `SeparatorPrimitive.Root` element with applied classes and forwarded props
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }