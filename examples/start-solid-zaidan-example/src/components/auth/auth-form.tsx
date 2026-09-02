import { getFormFieldErrors } from "@better-auth-ui/core"
import { createFormHook, createFormHookContexts } from "@tanstack/solid-form"
import type { ComponentProps } from "solid-js"
import { Show, splitProps } from "solid-js"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

export function focusFirstInvalidAuthFormControl(form: HTMLFormElement) {
  requestAnimationFrame(() => {
    form
      .querySelector<HTMLElement>(
        '[aria-invalid="true"]:not([disabled]), :invalid:not([disabled])'
      )
      ?.focus()
  })
}

export function isAuthFormFieldInvalid({
  isTouched,
  isValid
}: {
  isTouched: boolean
  isValid: boolean
}) {
  return isTouched && !isValid
}

function AuthFormFieldError() {
  const field = useFieldContext<unknown>()
  const isInvalid = () => isAuthFormFieldInvalid(field().state.meta)
  const errors = () => getFormFieldErrors(field().state.meta.errors)

  return (
    <Show when={isInvalid() && errors().length > 0}>
      <FieldError errors={errors()} />
    </Show>
  )
}

type AuthFormRootProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  prepareSubmit?: (
    form: HTMLFormElement
  ) => boolean | undefined | Promise<boolean | undefined>
}

function AuthFormRoot(props: AuthFormRootProps) {
  const form = useFormContext()
  const [local, formProps] = splitProps(props, ["prepareSubmit"])

  const submit = async (event: SubmitEvent) => {
    event.preventDefault()
    const formElement = event.currentTarget as HTMLFormElement
    if ((await local.prepareSubmit?.(formElement)) === false) return
    await form.handleSubmit()
    if (!form.state.isValid) focusFirstInvalidAuthFormControl(formElement)
  }

  return (
    <form
      {...formProps}
      onInvalid={(event) =>
        focusFirstInvalidAuthFormControl(event.currentTarget)
      }
      onSubmit={submit}
    />
  )
}

function AuthFormSubmitButton(
  props: Omit<ComponentProps<typeof Button>, "class"> & { class?: string }
) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting] as const}
    >
      {(state) => (
        <Button
          {...props}
          class={props.class}
          disabled={props.disabled || !state()[0] || state()[1]}
          type="submit"
        >
          <Show when={state()[1]}>
            <Spinner />
          </Show>
          {props.children}
        </Button>
      )}
    </form.Subscribe>
  )
}

export const { useAppForm: createAuthForm } = createFormHook({
  fieldComponents: { AuthFormFieldError },
  fieldContext,
  formComponents: { AuthFormRoot, AuthFormSubmitButton },
  formContext
})
