import { type ComponentProps, splitProps } from "solid-js"
import { cn } from "@/lib/utils"

type InputProps = ComponentProps<"input">

const Input = (props: InputProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <input
      class={cn(
        "z-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        local.class
      )}
      data-slot="input"
      {...others}
    />
  )
}

export { Input, type InputProps }
