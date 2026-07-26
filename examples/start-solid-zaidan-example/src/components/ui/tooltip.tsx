import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import * as TooltipPrimitive from "@kobalte/core/tooltip"
import type { ComponentProps, ValidComponent } from "solid-js"
import { mergeProps, splitProps } from "solid-js"
import { cn } from "@/lib/utils"

const Tooltip = (props: TooltipPrimitive.TooltipRootProps) => {
  const mergedProps = mergeProps(
    {
      openDelay: 0,
      placement: "top"
    } as TooltipPrimitive.TooltipRootProps,
    props
  )
  return <TooltipPrimitive.Root data-slot="tooltip" {...mergedProps} />
}

type TooltipTriggerProps<T extends ValidComponent = "button"> =
  PolymorphicProps<T, TooltipPrimitive.TooltipTriggerProps<T>>

const TooltipTrigger = <T extends ValidComponent = "button">(
  props: TooltipTriggerProps<T>
) => <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />

type TooltipContentProps<T extends ValidComponent = "div"> = PolymorphicProps<
  T,
  TooltipPrimitive.TooltipContentProps<T>
> &
  Pick<ComponentProps<T>, "class" | "children">

const TooltipContent = <T extends ValidComponent = "div">(
  props: TooltipContentProps<T>
) => {
  const [local, others] = splitProps(props as TooltipContentProps, [
    "class",
    "children"
  ])
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        class={cn(
          "z-50 z-tooltip-content w-fit max-w-xs origin-(--kb-tooltip-content-transform-origin) bg-foreground text-background",
          local.class
        )}
        {...others}
      >
        {local.children}
        <TooltipPrimitive.Arrow size={19} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipTrigger }
