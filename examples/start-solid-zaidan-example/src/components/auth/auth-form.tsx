import {
  type AdditionalField as AdditionalFieldConfig,
  type AdditionalFieldFormValue,
  getFormFieldErrors,
  validateAdditionalFieldRequired,
  validateAdditionalFieldValue
} from "@better-auth-ui/core"
import { createFormHook, createFormHookContexts } from "@tanstack/solid-form"
import { type ComponentProps, Show, splitProps } from "solid-js"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { AdditionalField, type AdditionalFieldProps } from "./additional-field"

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
  onBeforeSubmit?: () => void
}

function AuthFormRoot(props: AuthFormRootProps) {
  const form = useFormContext()
  const [local, formProps] = splitProps(props, ["onBeforeSubmit"])
  let submitting = false

  const submit = async (event: SubmitEvent) => {
    event.preventDefault()
    if (submitting || form.state.isSubmitting) return

    const formElement = event.currentTarget as HTMLFormElement
    local.onBeforeSubmit?.()
    submitting = true
    try {
      await form.handleSubmit()
      if (!form.state.isValid) focusFirstInvalidAuthFormControl(formElement)
    } finally {
      submitting = false
    }
  }

  return (
    <form
      {...formProps}
      on:invalid={{
        capture: true,
        handleEvent: (event) =>
          focusFirstInvalidAuthFormControl(event.currentTarget)
      }}
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

type AuthFormAdditionalFieldProps = Omit<
  AdditionalFieldProps,
  "errors" | "isInvalid" | "name" | "onBlur" | "onChange" | "value"
>

function AuthFormAdditionalField(props: AuthFormAdditionalFieldProps) {
  const field = useFieldContext<AdditionalFieldFormValue>()
  const isInvalid = () => isAuthFormFieldInvalid(field().state.meta)

  return (
    <AdditionalField
      {...props}
      errors={
        isInvalid() ? getFormFieldErrors(field().state.meta.errors) : undefined
      }
      isInvalid={isInvalid()}
      name={field().name}
      onBlur={field().handleBlur}
      onChange={field().handleChange}
      value={field().state.value}
    />
  )
}

export const { useAppForm: createAuthForm } = createFormHook({
  fieldComponents: { AuthFormAdditionalField, AuthFormFieldError },
  fieldContext,
  formComponents: { AuthFormRoot, AuthFormSubmitButton },
  formContext
})

export function getAuthAdditionalFieldValidators(
  field: AdditionalFieldConfig,
  requiredMessage: string
) {
  return {
    onChange: ({ value }: { value: AdditionalFieldFormValue }) =>
      validateAdditionalFieldRequired(field, value, requiredMessage),
    onChangeAsync: field.validate
      ? ({ value }: { value: AdditionalFieldFormValue }) =>
          validateAdditionalFieldValue(field, value)
      : undefined
  }
}
