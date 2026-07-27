import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps, JSX } from "solid-js"
import { createMemo, For, Show, splitProps } from "solid-js"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type FieldSetProps = ComponentProps<"fieldset"> & {
  class?: string | undefined
}

const FieldSet = (props: FieldSetProps) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <fieldset
      data-slot="field-set"
      class={cn("z-field-set flex flex-col", local.class)}
      {...others}
    />
  )
}

type FieldLegendProps = ComponentProps<"legend"> & {
  class?: string | undefined
  variant?: "legend" | "label"
}

const FieldLegend = (props: FieldLegendProps) => {
  const [local, others] = splitProps(props, ["class", "variant"])
  return (
    <legend
      data-slot="field-legend"
      data-variant={local.variant ?? "legend"}
      class={cn("z-field-legend", local.class)}
      {...others}
    />
  )
}

type FieldGroupProps = ComponentProps<"div"> & {
  class?: string | undefined
}

const FieldGroup = (props: FieldGroupProps) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <div
      data-slot="field-group"
      class={cn(
        "group/field-group @container/field-group z-field-group flex w-full flex-col",
        local.class
      )}
      {...others}
    />
  )
}

const fieldVariants = cva("group/field z-field flex w-full", {
  variants: {
    orientation: {
      vertical:
        "z-field-orientation-vertical flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal:
        "z-field-orientation-horizontal flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      responsive:
        "z-field-orientation-responsive @md/field-group:flex-row flex-col @md/field-group:items-center *:w-full @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
    }
  },
  defaultVariants: {
    orientation: "vertical"
  }
})

type FieldProps = ComponentProps<"div"> &
  VariantProps<typeof fieldVariants> & {
    class?: string | undefined
  }

const Field = (props: FieldProps) => {
  const [local, others] = splitProps(props, ["class", "orientation"])
  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" is intentional per shadcn design for accessibility
    <div
      role="group"
      data-slot="field"
      data-orientation={local.orientation ?? "vertical"}
      class={cn(fieldVariants({ orientation: local.orientation }), local.class)}
      {...others}
    />
  )
}

type FieldContentProps = ComponentProps<"div"> & {
  class?: string | undefined
}

const FieldContent = (props: FieldContentProps) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <div
      data-slot="field-content"
      class={cn(
        "group/field-content z-field-content flex flex-1 flex-col leading-snug",
        local.class
      )}
      {...others}
    />
  )
}

type FieldLabelProps = ComponentProps<typeof Label> & {
  class?: string | undefined
}

const FieldLabel = (props: FieldLabelProps) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <Label
      data-slot="field-label"
      class={cn(
        "group/field-label peer/field-label z-field-label flex w-fit leading-snug",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        local.class
      )}
      {...others}
    />
  )
}

type FieldTitleProps = ComponentProps<"div"> & {
  class?: string | undefined
}

const FieldTitle = (props: FieldTitleProps) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <div
      data-slot="field-label"
      class={cn(
        "z-field-title z-font-heading flex w-fit items-center leading-snug",
        local.class
      )}
      {...others}
    />
  )
}

type FieldDescriptionProps = ComponentProps<"p"> & {
  class?: string | undefined
}

const FieldDescription = (props: FieldDescriptionProps) => {
  const [local, others] = splitProps(props, ["class"])
  return (
    <p
      data-slot="field-description"
      class={cn(
        "z-field-description font-normal leading-normal group-has-data-[orientation=horizontal]/field:text-balance",
        "nth-last-2:-mt-1 last:mt-0",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        local.class
      )}
      {...others}
    />
  )
}

type FieldSeparatorProps = ComponentProps<"div"> & {
  class?: string | undefined
  children?: JSX.Element
}

const FieldSeparator = (props: FieldSeparatorProps) => {
  const [local, others] = splitProps(props, ["class", "children"])
  return (
    <div
      data-slot="field-separator"
      data-content={!!local.children}
      class={cn("relative z-field-separator", local.class)}
      {...others}
    >
      <Separator class="absolute inset-0 top-1/2" />
      <Show when={local.children}>
        <span
          class="relative z-field-separator-content mx-auto block w-fit bg-background"
          data-slot="field-separator-content"
        >
          {local.children}
        </span>
      </Show>
    </div>
  )
}

type FieldErrorProps = ComponentProps<"div"> & {
  class?: string | undefined
  children?: JSX.Element
  errors?: Array<{ message?: string } | undefined>
}

const FieldError = (props: FieldErrorProps) => {
  const [local, others] = splitProps(props, ["class", "children", "errors"])

  const content = createMemo(() => {
    if (local.children) {
      return local.children
    }

    if (!local.errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(local.errors.map((error) => [error?.message, error])).values()
    ]

    if (uniqueErrors?.length === 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul class="ml-4 flex list-disc flex-col gap-1">
        <For each={uniqueErrors}>
          {(error) => (
            <Show when={error?.message}>
              <li>{error?.message}</li>
            </Show>
          )}
        </For>
      </ul>
    )
  })

  return (
    <Show when={content()}>
      <div
        role="alert"
        data-slot="field-error"
        class={cn("z-field-error font-normal", local.class)}
        {...others}
      >
        {content()}
      </div>
    </Show>
  )
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
  fieldVariants
}
