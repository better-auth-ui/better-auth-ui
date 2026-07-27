import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import * as SwitchPrimitive from "@kobalte/core/switch"
import {
  type ComponentProps,
  mergeProps,
  splitProps,
  type ValidComponent
} from "solid-js"

import { cn } from "@/lib/utils"

type SwitchProps<T extends ValidComponent = "div"> = PolymorphicProps<
  T,
  SwitchPrimitive.SwitchRootProps<T>
> &
  Pick<ComponentProps<T>, "class" | "children"> & {
    size?: "sm" | "default"
  }

const Switch = <T extends ValidComponent = "div">(props: SwitchProps<T>) => {
  const mergedProps = mergeProps({ size: "default" as const }, props)
  const [local, others] = splitProps(mergedProps as SwitchProps, [
    "class",
    "size",
    "id"
  ])
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={local.size}
      class={cn(
        "peer group/switch relative z-switch inline-flex items-center outline-none transition-all data-disabled:cursor-not-allowed data-disabled:opacity-50",
        local.class
      )}
      {...others}
    >
      <SwitchPrimitive.Input
        data-slot="switch-input"
        class="peer sr-only"
        id={local.id}
      />
      <SwitchPrimitive.Control
        data-slot="switch-control"
        class="absolute inset-0 flex cursor-pointer items-center rounded-full transition-colors data-disabled:cursor-not-allowed"
        onClick={(e) => e.preventDefault()}
      >
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          class="pointer-events-none z-switch-thumb block rounded-full ring-0 transition-transform"
        />
      </SwitchPrimitive.Control>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
