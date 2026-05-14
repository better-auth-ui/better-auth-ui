import { cva, type VariantProps } from "class-variance-authority"
import {
  type ComponentProps,
  mergeProps,
  splitProps,
  type ValidComponent
} from "solid-js"
import { Dynamic } from "solid-js/web"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type ItemVariant = "default" | "outline" | "muted"
type ItemSize = "default" | "sm" | "xs"
type ItemMediaVariant = "default" | "icon" | "image"

const itemVariants = cva(
  "group/item flex w-full items-center gap-3 rounded-lg p-3 text-sm outline-none transition-colors",
  {
    variants: {
      variant: {
        default: "",
        outline: "border bg-background",
        muted: "bg-muted/50"
      },
      size: {
        default: "",
        sm: "gap-2 p-2",
        xs: "gap-2 p-1.5"
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default"
    }
  }
)

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground",
  {
    variants: {
      variant: {
        default: "size-10",
        icon: "size-8",
        image: "size-10 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

type ItemProps = ComponentProps<"div"> & {
  as?: ValidComponent
} & VariantProps<typeof itemVariants>

const Item = (props: ItemProps) => {
  const mergedProps = mergeProps(
    { as: "div", size: "default", variant: "default" } as const,
    props
  )
  const [local, others] = splitProps(mergedProps, [
    "as",
    "class",
    "size",
    "variant"
  ])

  return (
    <Dynamic
      component={local.as}
      class={cn(
        itemVariants({ size: local.size, variant: local.variant }),
        local.class
      )}
      data-size={local.size}
      data-slot="item"
      data-variant={local.variant}
      {...others}
    />
  )
}

type ItemGroupProps = ComponentProps<"div">

const ItemGroup = (props: ItemGroupProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    // biome-ignore lint/a11y/useSemanticElements: Zaidan ItemGroup source shape is a div with role=list.
    <div
      class={cn("flex w-full flex-col gap-0.5", local.class)}
      data-slot="item-group"
      role="list"
      {...others}
    />
  )
}

type ItemMediaProps = ComponentProps<"div"> &
  VariantProps<typeof itemMediaVariants>

const ItemMedia = (props: ItemMediaProps) => {
  const [local, others] = splitProps(props, ["class", "variant"])

  return (
    <div
      class={cn(itemMediaVariants({ variant: local.variant }), local.class)}
      data-slot="item-media"
      data-variant={local.variant}
      {...others}
    />
  )
}

type ItemHeaderProps = ComponentProps<"div">

const ItemHeader = (props: ItemHeaderProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn("flex items-center gap-2", local.class)}
      data-slot="item-header"
      {...others}
    />
  )
}

type ItemFooterProps = ComponentProps<"div">

const ItemFooter = (props: ItemFooterProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn("flex items-center gap-2", local.class)}
      data-slot="item-footer"
      {...others}
    />
  )
}

type ItemContentProps = ComponentProps<"div">

const ItemContent = (props: ItemContentProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn("grid min-w-0 flex-1 gap-1", local.class)}
      data-slot="item-content"
      {...others}
    />
  )
}

type ItemTitleProps = ComponentProps<"div">

const ItemTitle = (props: ItemTitleProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn("truncate font-medium leading-none", local.class)}
      data-slot="item-title"
      {...others}
    />
  )
}

type ItemDescriptionProps = ComponentProps<"p">

const ItemDescription = (props: ItemDescriptionProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <p
      class={cn("text-muted-foreground text-xs", local.class)}
      data-slot="item-description"
      {...others}
    />
  )
}

type ItemActionsProps = ComponentProps<"div">

const ItemActions = (props: ItemActionsProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn("ml-auto flex shrink-0 items-center gap-2", local.class)}
      data-slot="item-actions"
      {...others}
    />
  )
}

type ItemSeparatorProps = Omit<ComponentProps<typeof Separator>, "class"> & {
  class?: string
}

const ItemSeparator = (props: ItemSeparatorProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <Separator
      class={cn("my-0", local.class)}
      data-slot="item-separator"
      {...others}
    />
  )
}

export type { ItemMediaVariant, ItemSize, ItemVariant }
export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
  itemMediaVariants,
  itemVariants
}
