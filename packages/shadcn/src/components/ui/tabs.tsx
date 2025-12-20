import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * Wraps the Radix UI Tabs root with a standardized vertical layout and a `data-slot="tabs"` attribute.
 *
 * Merges any provided `className` with the default "flex flex-col gap-2" classes and forwards all other props to the underlying Radix Tabs root.
 *
 * @param className - Additional className(s) merged with the default layout classes
 * @returns The rendered Radix Tabs root element
 */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

/**
 * Render a styled Tabs list wrapper that applies standardized layout, spacing, and a `data-slot="tabs-list"` attribute.
 *
 * @param className - Optional additional CSS classes to merge with the component's default styling.
 * @param props - Additional props forwarded to the underlying Radix `TabsPrimitive.List`.
 * @returns The rendered Tabs list element with the applied classes and `data-slot` attribute.
 */
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a styled tabs trigger that wraps Radix UI's TabsPrimitive.Trigger and applies standardized classes and a `data-slot="tabs-trigger"` attribute.
 *
 * @param className - Additional CSS classes to merge with the component's default classes.
 * @param props - Remaining props are forwarded to the underlying Radix `TabsPrimitive.Trigger`.
 * @returns The rendered Tabs trigger element with merged class names and forwarded props.
 */
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a tab panel container that wraps Radix `TabsPrimitive.Content`, applies standard layout styling, and sets `data-slot="tabs-content"`.
 *
 * @returns A React element for the tab content area with the combined class names (`"flex-1 outline-none"` plus any `className`) and `data-slot="tabs-content"`.
 */
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }