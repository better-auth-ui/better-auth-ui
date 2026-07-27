import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import {
  Item,
  ItemIndicator,
  ItemInput,
  type RadioGroupItemProps as RadioGroupItemPrimitiveProps,
  RadioGroup as RadioGroupRoot,
  type RadioGroupRootProps
} from "@kobalte/core/radio-group"
import { Circle } from "lucide-solid"
import { type ComponentProps, splitProps, type ValidComponent } from "solid-js"

import { cn } from "@/lib/utils"

type RadioGroupProps<T extends ValidComponent = "div"> = PolymorphicProps<
  T,
  RadioGroupRootProps<T>
> &
  Pick<ComponentProps<T>, "class" | "children">

const RadioGroup = <T extends ValidComponent = "div">(
  props: RadioGroupProps<T>
) => {
  const [local, others] = splitProps(props as RadioGroupProps, ["class"])
  return (
    <RadioGroupRoot
      data-slot="radio-group"
      class={cn("z-radio-group w-full", local.class)}
      {...others}
    />
  )
}

type RadioGroupItemProps<T extends ValidComponent = "div"> = PolymorphicProps<
  T,
  RadioGroupItemPrimitiveProps<T>
> &
  Pick<ComponentProps<T>, "class" | "children">

const RadioGroupItem = <T extends ValidComponent = "div">(
  props: RadioGroupItemProps<T>
) => {
  const [local, others] = splitProps(props as RadioGroupItemProps, [
    "class",
    "id"
  ])
  return (
    <Item
      data-slot="radio-group-item"
      class={cn(
        "group/radio-group-item peer relative z-radio-group-item aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        local.class
      )}
      {...others}
    >
      <ItemInput
        data-slot="radio-group-item-input"
        class="peer sr-only"
        id={local.id}
      />
      <ItemIndicator
        data-slot="radio-group-indicator"
        class="z-radio-group-indicator"
      >
        <Circle class="z-radio-group-indicator-icon" />
      </ItemIndicator>
    </Item>
  )
}

export { RadioGroup, RadioGroupItem }
