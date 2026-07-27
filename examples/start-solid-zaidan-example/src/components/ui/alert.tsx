import type { PolymorphicProps } from "@kobalte/core"
import { type AlertRootProps, Root } from "@kobalte/core/alert"
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps, ValidComponent } from "solid-js"
import { splitProps } from "solid-js"
import { cn } from "@/lib/utils"

const alertVariants = cva("group/alert relative z-alert w-full", {
  variants: {
    variant: {
      default: "z-alert-variant-default",
      destructive: "z-alert-variant-destructive"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

type AlertProps<T extends ValidComponent = "div"> = PolymorphicProps<
  T,
  AlertRootProps<T>
> &
  VariantProps<typeof alertVariants>

const Alert = <T extends ValidComponent = "div">(props: AlertProps<T>) => {
  const [local, others] = splitProps(props as AlertProps, ["class", "variant"])

  return (
    <Root
      class={cn(alertVariants({ variant: local.variant }), local.class)}
      data-slot="alert"
      role="alert"
      {...others}
    />
  )
}

type AlertTitleProps = ComponentProps<"div">

const AlertTitle = (props: AlertTitleProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn(
        "z-alert-title z-font-heading [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        local.class
      )}
      data-slot="alert-title"
      {...others}
    />
  )
}

type AlertDescriptionProps = ComponentProps<"div">

const AlertDescription = (props: AlertDescriptionProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn(
        "z-alert-description [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        local.class
      )}
      data-slot="alert-description"
      {...others}
    />
  )
}

type AlertActionProps = ComponentProps<"div">

const AlertAction = (props: AlertActionProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      class={cn("z-alert-action", local.class)}
      data-slot="alert-action"
      {...others}
    />
  )
}

export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants }
