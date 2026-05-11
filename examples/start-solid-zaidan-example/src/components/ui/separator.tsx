import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import {
  Separator as SeparatorPrimitive,
  type SeparatorRootProps
} from "@kobalte/core/separator"
import {
  type ComponentProps,
  mergeProps,
  splitProps,
  type ValidComponent
} from "solid-js"

import { cn } from "@/lib/utils"

type SeparatorProps<T extends ValidComponent = "hr"> = PolymorphicProps<
  T,
  SeparatorRootProps<T>
> &
  Pick<ComponentProps<T>, "class">

const Separator = <T extends ValidComponent = "hr">(
  props: SeparatorProps<T>
) => {
  const mergedProps = mergeProps({ orientation: "horizontal" } as const, props)
  const [local, others] = splitProps(mergedProps as SeparatorProps, ["class"])

  return (
    <SeparatorPrimitive
      data-slot="separator"
      class={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        local.class
      )}
      {...others}
    />
  )
}

export { Separator, type SeparatorProps }
