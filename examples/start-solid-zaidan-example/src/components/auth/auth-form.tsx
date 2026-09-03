import {
  type AdditionalField as AdditionalFieldConfig,
  type AdditionalFieldFormValue,
  DEFAULT_ADDITIONAL_FIELD_VALIDATION_DEBOUNCE_MS,
  getFormFieldErrors,
  normalizeAuthFormServerError,
  validateAdditionalFieldRequired,
  validateAdditionalFieldValue
} from "@better-auth-ui/core"
import {
  type AnyFormApi,
  createFormHook,
  createFormHookContexts
} from "@tanstack/solid-form"
import { type ComponentProps, type JSX, Show, splitProps } from "solid-js"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { AdditionalField, type AdditionalFieldProps } from "./additional-field"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

const DEFAULT_AUTH_FORM_SERVER_ERROR = "Unable to submit this form. Try again."

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

function AuthFormServerError() {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.errorMap.onServer}>
      {(error) => {
        const errors = () => {
          const current = error()
          const formError =
            current && typeof current === "object" && "form" in current
              ? current.form
              : current
          return getFormFieldErrors(formError ? [formError] : [])
        }
        return (
          <Show when={errors().length > 0}>
            <FieldError errors={errors()} />
          </Show>
        )
      }}
    </form.Subscribe>
  )
}

export function setAuthFormServerError(
  form: AnyFormApi,
  error: unknown,
  fallbackMessage: string
) {
  const normalized = normalizeAuthFormServerError(error, fallbackMessage)
  form.setErrorMap({
    onServer: {
      fields: normalized.fields ?? {},
      form: normalized.form
    }
  })
}

export function clearAuthFormServerError(form: AnyFormApi) {
  form.setErrorMap({ onServer: undefined })
}

export async function submitAuthForm(
  form: AnyFormApi,
  serverErrorMessage = DEFAULT_AUTH_FORM_SERVER_ERROR
) {
  clearAuthFormServerError(form)
  try {
    await form.handleSubmit()
    return form.state.isValid
  } catch (error) {
    if (!form.state.errorMap.onServer) {
      setAuthFormServerError(form, error, serverErrorMessage)
    }
    return false
  }
}

type AuthFormRootProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  onBeforeSubmit?: () => void
  serverErrorMessage?: string
}

function AuthFormRoot(props: AuthFormRootProps) {
  const form = useFormContext()
  const [local, formProps] = splitProps(props, [
    "onBeforeSubmit",
    "serverErrorMessage"
  ])
  let submitting = false

  const submit = async (event: SubmitEvent) => {
    event.preventDefault()
    if (submitting || form.state.isSubmitting) return

    const formElement = event.currentTarget as HTMLFormElement
    local.onBeforeSubmit?.()
    submitting = true
    try {
      const isValid = await submitAuthForm(
        form,
        local.serverErrorMessage ?? DEFAULT_AUTH_FORM_SERVER_ERROR
      )
      if (!isValid) focusFirstInvalidAuthFormControl(formElement)
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

type AuthFormTextFieldProps = Omit<
  ComponentProps<typeof Input>,
  "name" | "onBlur" | "onInput" | "value"
> & {
  description?: JSX.Element
  label: JSX.Element
}

function AuthFormTextField(props: AuthFormTextFieldProps) {
  const field = useFieldContext<string>()
  const [local, inputProps] = splitProps(props, ["description", "id", "label"])
  const isInvalid = () => isAuthFormFieldInvalid(field().state.meta)
  const inputId = () => local.id ?? field().name

  return (
    <Field data-invalid={isInvalid()}>
      <FieldLabel for={inputId()}>{local.label}</FieldLabel>
      <Input
        {...inputProps}
        aria-invalid={isInvalid()}
        id={inputId()}
        name={field().name}
        onBlur={field().handleBlur}
        onInput={(event) => field().handleChange(event.currentTarget.value)}
        value={field().state.value}
      />
      <Show when={local.description}>
        <FieldDescription>{local.description}</FieldDescription>
      </Show>
      <AuthFormFieldError />
    </Field>
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
          aria-disabled={
            props.disabled || !state()[0] || state()[1] || undefined
          }
          class={props.class}
          disabled={props.disabled || state()[1]}
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

export const {
  useAppForm: createAuthForm,
  withFieldGroup: withAuthFieldGroup,
  withForm: withAuthForm
} = createFormHook({
  fieldComponents: {
    AuthFormAdditionalField,
    AuthFormFieldError,
    AuthFormTextField
  },
  fieldContext,
  formComponents: {
    AuthFormRoot,
    AuthFormServerError,
    AuthFormSubmitButton
  },
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
      : undefined,
    onChangeAsyncDebounceMs: field.validate
      ? (field.validateDebounceMs ??
        DEFAULT_ADDITIONAL_FIELD_VALIDATION_DEBOUNCE_MS)
      : undefined
  }
}
