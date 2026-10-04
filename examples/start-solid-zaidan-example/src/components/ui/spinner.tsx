import { LoaderCircle } from "lucide-solid"
import type { ComponentProps } from "solid-js"
import { splitProps } from "solid-js"
import { cn } from "cn"

type SpinnerProps = ComponentProps<"svg"> & {
  class?: string | undefined
}

const Spinner = (props: SpinnerProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <LoaderCircle
      aria-label="Loading"
      class={cn("z-spinner size-4 animate-spin", local.class)}
      data-slot="spinner"
      role="status"
      {...others}
    />
  )
}

export { Spinner }
