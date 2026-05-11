import { type ComponentProps, mergeProps, splitProps } from "solid-js"

import { cn } from "@/lib/utils"

type CardProps = ComponentProps<"div"> & { size?: "default" | "sm" }

const Card = (props: CardProps) => {
  const mergedProps = mergeProps({ size: "default" } as const, props)
  const [local, others] = splitProps(mergedProps, ["class", "size"])

  return (
    <div
      class={cn("group/card z-card flex flex-col", local.class)}
      data-size={local.size}
      data-slot="card"
      {...others}
    />
  )
}

type CardHeaderProps = ComponentProps<"div">

const CardHeader = (props: CardHeaderProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn(
        "group/card-header @container/card-header z-card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        local.class
      )}
      data-slot="card-header"
      {...others}
    />
  )
}

type CardTitleProps = ComponentProps<"div">

const CardTitle = (props: CardTitleProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn("z-card-title z-font-heading", local.class)}
      data-slot="card-title"
      {...others}
    />
  )
}

type CardDescriptionProps = ComponentProps<"div">

const CardDescription = (props: CardDescriptionProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn("z-card-description", local.class)}
      data-slot="card-description"
      {...others}
    />
  )
}

type CardActionProps = ComponentProps<"div">

const CardAction = (props: CardActionProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn(
        "z-card-action col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        local.class
      )}
      data-slot="card-action"
      {...others}
    />
  )
}

type CardContentProps = ComponentProps<"div">

const CardContent = (props: CardContentProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn("z-card-content", local.class)}
      data-slot="card-content"
      {...others}
    />
  )
}

type CardFooterProps = ComponentProps<"div">

const CardFooter = (props: CardFooterProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn("z-card-footer flex items-center", local.class)}
      data-slot="card-footer"
      {...others}
    />
  )
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
}
