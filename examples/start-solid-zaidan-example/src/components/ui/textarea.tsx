import { type ComponentProps, splitProps } from "solid-js"
import { cn } from "cn"

type TextareaProps = ComponentProps<"textarea">

const Textarea = (props: TextareaProps) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <textarea
      class={cn(
        "z-textarea field-sizing-content min-h-16 w-full min-w-0 resize-y bg-transparent outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        local.class
      )}
      data-slot="textarea"
      {...others}
    />
  )
}

export { Textarea, type TextareaProps }
