import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "solid-js"
import { splitProps } from "solid-js"
import { cn } from "@/lib/utils"

type EmptyProps = ComponentProps<"div">

const Empty = (props: EmptyProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      data-slot="empty"
      class={cn(
        "z-empty flex w-full min-w-0 flex-1 flex-col items-center justify-center text-balance text-center",
        local.class
      )}
      {...others}
    />
  )
}

type EmptyHeaderProps = ComponentProps<"div">

const EmptyHeader = (props: EmptyHeaderProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      data-slot="empty-header"
      class={cn(
        "z-empty-header flex max-w-sm flex-col items-center",
        local.class
      )}
      {...others}
    />
  )
}

const emptyMediaVariants = cva(
  "z-empty-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "z-empty-media-default",
        icon: "z-empty-media-icon"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

type EmptyMediaProps = ComponentProps<"div"> &
  VariantProps<typeof emptyMediaVariants>

const EmptyMedia = (props: EmptyMediaProps) => {
  const [local, others] = splitProps(props, ["class", "variant"])

  return (
    <div
      data-slot="empty-icon"
      data-variant={local.variant}
      class={cn(emptyMediaVariants({ variant: local.variant }), local.class)}
      {...others}
    />
  )
}

type EmptyTitleProps = ComponentProps<"div">

const EmptyTitle = (props: EmptyTitleProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      data-slot="empty-title"
      class={cn("z-empty-title z-font-heading", local.class)}
      {...others}
    />
  )
}

type EmptyDescriptionProps = ComponentProps<"p">

const EmptyDescription = (props: EmptyDescriptionProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      data-slot="empty-description"
      class={cn(
        "z-empty-description text-muted-foreground [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        local.class
      )}
      {...others}
    />
  )
}

type EmptyContentProps = ComponentProps<"div">

const EmptyContent = (props: EmptyContentProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      data-slot="empty-content"
      class={cn(
        "z-empty-content flex w-full min-w-0 max-w-sm flex-col items-center text-balance",
        local.class
      )}
      {...others}
    />
  )
}

export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
}
