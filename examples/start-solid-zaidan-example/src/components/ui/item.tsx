import { cva, type VariantProps } from "class-variance-authority"
import {
  type ComponentProps,
  type JSX,
  mergeProps,
  splitProps,
  type ValidComponent
} from "solid-js"
import { Dynamic } from "solid-js/web"
import { Separator, type SeparatorProps } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type ItemVariant = "default" | "outline" | "muted"
type ItemSize = "default" | "sm" | "xs"
type ItemMediaVariant = "default" | "icon" | "image"

type ItemGroupProps = ComponentProps<"div">

const ItemGroup = (props: ItemGroupProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    // Div with role=list keeps the upstream Zaidan item-group shape flexible.
    <div
      class={cn(
        "group/item-group z-item-group flex w-full flex-col",
        local.class
      )}
      data-slot="item-group"
      role="list"
      {...others}
    />
  )
}

type ItemSeparatorProps = SeparatorProps

const ItemSeparator = (props: ItemSeparatorProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <Separator
      class={cn("z-item-separator", local.class)}
      data-slot="item-separator"
      orientation="horizontal"
      {...others}
    />
  )
}

const itemVariants = cva(
  "group/item z-item flex w-full flex-wrap items-center outline-none transition-colors duration-100 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors",
  {
    variants: {
      variant: {
        default: "z-item-variant-default",
        outline: "z-item-variant-outline",
        muted: "z-item-variant-muted"
      },
      size: {
        default: "z-item-size-default",
        sm: "z-item-size-sm",
        xs: "z-item-size-xs"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

type ItemProps<T extends ValidComponent = "div"> = {
  as?: T
  class?: string | undefined
  children?: JSX.Element
} & VariantProps<typeof itemVariants> &
  Omit<ComponentProps<T>, "as" | "class" | "children">

const Item = <T extends ValidComponent = "div">(rawProps: ItemProps<T>) => {
  const props = mergeProps(
    { as: "div" as T, variant: "default", size: "default" } as const,
    rawProps
  )
  const [local, others] = splitProps(props as ItemProps, [
    "as",
    "class",
    "variant",
    "size"
  ])

  return (
    <Dynamic
      class={cn(
        itemVariants({ variant: local.variant, size: local.size }),
        local.class
      )}
      component={local.as}
      data-size={local.size}
      data-slot="item"
      data-variant={local.variant}
      {...others}
    />
  )
}

const itemMediaVariants = cva(
  "z-item-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "z-item-media-variant-default",
        icon: "z-item-media-variant-icon",
        image: "z-item-media-variant-image"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

type ItemMediaProps = ComponentProps<"div"> &
  VariantProps<typeof itemMediaVariants>

const ItemMedia = (rawProps: ItemMediaProps) => {
  const props = mergeProps({ variant: "default" } as const, rawProps)
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

type ItemContentProps = ComponentProps<"div">

const ItemContent = (props: ItemContentProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn(
        "z-item-content flex flex-1 flex-col [&+[data-slot=item-content]]:flex-none",
        local.class
      )}
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
      class={cn(
        "z-font-heading z-item-title line-clamp-1 flex w-fit items-center",
        local.class
      )}
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
      class={cn(
        "z-item-description line-clamp-2 font-normal [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        local.class
      )}
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
      class={cn("z-item-actions flex items-center", local.class)}
      data-slot="item-actions"
      {...others}
    />
  )
}

type ItemHeaderProps = ComponentProps<"div">

const ItemHeader = (props: ItemHeaderProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn(
        "z-item-header flex basis-full items-center justify-between",
        local.class
      )}
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
      class={cn(
        "z-item-footer flex basis-full items-center justify-between",
        local.class
      )}
      data-slot="item-footer"
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
