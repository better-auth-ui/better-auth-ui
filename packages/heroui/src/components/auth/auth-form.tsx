import {
  type AdditionalField as AdditionalFieldConfig,
  type AdditionalFieldFormValue,
  DEFAULT_ADDITIONAL_FIELD_VALIDATION_DEBOUNCE_MS,
  getFormFieldErrorMessage,
  getFormFieldErrors,
  validateAdditionalFieldRequired,
  validateAdditionalFieldValue
} from "@better-auth-ui/core"
import { Button, FieldError, Form, Spinner } from "@heroui/react"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"
import {
  type ComponentProps,
  type FormEvent,
  type ReactNode,
  useRef
} from "react"
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

function AuthFormFieldError() {
  const field = useFieldContext<unknown>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const message = isInvalid
    ? getFormFieldErrorMessage(field.state.meta.errors)
    : undefined

  return message ? <FieldError>{message}</FieldError> : null
}

type AuthFormRootProps = Omit<ComponentProps<typeof Form>, "onSubmit"> & {
  onBeforeSubmit?: () => void
}

function AuthFormRoot({
  children,
  onBeforeSubmit,
  ...props
}: AuthFormRootProps) {
  const form = useFormContext()
  const submittingRef = useRef(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current || form.state.isSubmitting) return

    const formElement = event.currentTarget
    onBeforeSubmit?.()
    submittingRef.current = true
    try {
      await form.handleSubmit()
      if (!form.state.isValid) focusFirstInvalidAuthFormControl(formElement)
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <Form
      {...props}
      onInvalid={(event) =>
        focusFirstInvalidAuthFormControl(event.currentTarget)
      }
      onSubmit={submit}
    >
      {children}
    </Form>
  )
}

function AuthFormSubmitButton({
  children,
  isDisabled,
  ...props
}: Omit<ComponentProps<typeof Button>, "children"> & { children?: ReactNode }) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting] as const}
    >
      {([canSubmit, isSubmitting]) => (
        <Button
          {...props}
          isDisabled={isDisabled || !canSubmit || isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Spinner /> : null}
          {children}
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
  const isInvalid = isAuthFormFieldInvalid(field.state.meta)

  return (
    <AdditionalField
      {...props}
      errors={
        isInvalid ? getFormFieldErrors(field.state.meta.errors) : undefined
      }
      isInvalid={isInvalid}
      name={field.name}
      onBlur={field.handleBlur}
      onChange={field.handleChange}
      value={field.state.value}
    />
  )
}

export const {
  useAppForm: useAuthForm,
  useTypedAppFormContext: useTypedAuthFormContext,
  withFieldGroup: withAuthFieldGroup,
  withForm: withAuthForm
} = createFormHook({
  fieldComponents: { AuthFormAdditionalField, AuthFormFieldError },
  fieldContext,
  formComponents: { AuthFormRoot, AuthFormSubmitButton },
  formContext
})

export function isAuthFormFieldInvalid({
  isTouched,
  isValid
}: {
  isTouched: boolean
  isValid: boolean
}) {
  return isTouched && !isValid
}

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
