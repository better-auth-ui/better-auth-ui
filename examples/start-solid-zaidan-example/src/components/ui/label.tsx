/** biome-ignore-all lint/a11y/noLabelWithoutControl: component file; for/htmlFor is provided by consumers */
import type { ComponentProps } from "solid-js"
import { splitProps } from "solid-js"
import { cn } from "@/lib/utils"

type LabelProps = ComponentProps<"label">

const Label = (props: LabelProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <label
      class={cn(
        "z-label flex select-none items-center peer-disabled:cursor-not-allowed group-data-[disabled=true]:pointer-events-none",
        local.class
      )}
      data-slot="label"
      {...others}
    />
  )
}

export { Label, type LabelProps }
