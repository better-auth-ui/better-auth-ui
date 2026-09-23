import { cva, type VariantProps } from "class-variance-authority"
import { type ComponentProps, type JSX, splitProps } from "solid-js"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type InputGroupProps = ComponentProps<"div">

const InputGroup = (props: InputGroupProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    // Input group needs group semantics without fieldset styling constraints.
    <div
      class={cn(
        "group/input-group relative z-input-group flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto",
        local.class
      )}
      data-slot="input-group"
      role="group"
      {...others}
    />
  )
}

const inputGroupAddonVariants = cva(
  "z-input-group-addon flex cursor-text select-none items-center justify-center",
  {
    variants: {
      align: {
        "inline-start": "z-input-group-addon-align-inline-start order-first",
        "inline-end": "z-input-group-addon-align-inline-end order-last",
        "block-start":
          "z-input-group-addon-align-block-start order-first w-full justify-start",
        "block-end":
          "z-input-group-addon-align-block-end order-last w-full justify-start"
      }
    },
    defaultVariants: {
      align: "inline-start"
    }
  }
)

type InputGroupAddonProps = ComponentProps<"div"> &
  VariantProps<typeof inputGroupAddonVariants>

const InputGroupAddon = (props: InputGroupAddonProps) => {
  const [local, others] = splitProps(props, ["class", "align", "onClick"])
  const align = () => local.align ?? "inline-start"

  const handleClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (event) => {
    if ((event.target as HTMLElement).closest("button")) return

    event.currentTarget.parentElement?.querySelector("input")?.focus()
    if (typeof local.onClick === "function") local.onClick(event)
  }

  return (
    // Input group addon needs group semantics without fieldset styling constraints.
    // Click delegates focus to the input inside the group.
    <div
      class={cn(inputGroupAddonVariants({ align: align() }), local.class)}
      data-align={align()}
      data-slot="input-group-addon"
      onClick={handleClick}
      role="group"
      {...others}
    />
  )
}

const inputGroupButtonVariants = cva(
  "z-input-group-button flex items-center shadow-none",
  {
    variants: {
      size: {
        xs: "z-input-group-button-size-xs",
        sm: "z-input-group-button-size-sm",
        "icon-xs": "z-input-group-button-size-icon-xs",
        "icon-sm": "z-input-group-button-size-icon-sm"
      }
    },
    defaultVariants: {
      size: "xs"
    }
  }
)

type InputGroupButtonProps = Omit<ButtonProps, "size"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset"
  }

const InputGroupButton = (props: InputGroupButtonProps) => {
  const [local, others] = splitProps(props, [
    "class",
    "type",
    "variant",
    "size"
  ])
  const size = () => local.size ?? "xs"
  const variant = () => local.variant ?? "ghost"
  const type = () => local.type ?? "button"

  return (
    <Button
      class={cn(inputGroupButtonVariants({ size: size() }), local.class)}
      data-size={size()}
      type={type()}
      variant={variant()}
      {...others}
    />
  )
}

type InputGroupTextProps = ComponentProps<"span">

const InputGroupText = (props: InputGroupTextProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <span
      class={cn(
        "z-input-group-text flex items-center [&_svg]:pointer-events-none",
        local.class
      )}
      {...others}
    />
  )
}

type InputGroupInputProps = ComponentProps<"input">

const InputGroupInput = (props: InputGroupInputProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <Input
      class={cn("z-input-group-input flex-1", local.class)}
      data-slot="input-group-control"
      {...others}
    />
  )
}

type InputGroupTextareaProps = ComponentProps<"textarea">

const InputGroupTextarea = (props: InputGroupTextareaProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <Textarea
      class={cn("z-input-group-textarea flex-1 resize-none", local.class)}
      data-slot="input-group-control"
      {...others}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  type InputGroupAddonProps,
  InputGroupButton,
  type InputGroupButtonProps,
  InputGroupInput,
  type InputGroupInputProps,
  type InputGroupProps,
  InputGroupText,
  InputGroupTextarea,
  type InputGroupTextareaProps,
  type InputGroupTextProps
}
