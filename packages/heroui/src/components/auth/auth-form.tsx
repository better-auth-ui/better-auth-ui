import {
  type AdditionalField as AdditionalFieldConfig,
  type AdditionalFieldFormValue,
  DEFAULT_ADDITIONAL_FIELD_VALIDATION_DEBOUNCE_MS,
  getFormFieldErrorMessage,
  getFormFieldErrors,
  normalizeAuthFormServerError,
  validateAdditionalFieldRequired,
  validateAdditionalFieldValue
} from "@better-auth-ui/core"
import {
  Button,
  Description,
  ErrorMessage,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField
} from "@heroui/react"
import {
  type AnyFormApi,
  createFormHook,
  createFormHookContexts
} from "@tanstack/react-form"
import {
  type ComponentProps,
  type FormEvent,
  type ReactNode,
  useRef
} from "react"
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

function AuthFormFieldError() {
  const field = useFieldContext<unknown>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const message = isInvalid
    ? getFormFieldErrorMessage(field.state.meta.errors)
    : undefined

  return message ? <FieldError>{message}</FieldError> : null
}

function AuthFormServerError() {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.errorMap.onServer}>
      {(error) => {
        const formError =
          error && typeof error === "object" && "form" in error
            ? error.form
            : error
        const message = getFormFieldErrorMessage(formError ? [formError] : [])
        return message ? <ErrorMessage>{message}</ErrorMessage> : null
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

type AuthFormRootProps = Omit<ComponentProps<typeof Form>, "onSubmit"> & {
  onBeforeSubmit?: () => void
  serverErrorMessage?: string
}

function AuthFormRoot({
  children,
  onBeforeSubmit,
  serverErrorMessage = DEFAULT_AUTH_FORM_SERVER_ERROR,
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
      const isValid = await submitAuthForm(form, serverErrorMessage)
      if (!isValid) focusFirstInvalidAuthFormControl(formElement)
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <Form
      {...props}
      validationBehavior="aria"
      onInvalid={(event) =>
        focusFirstInvalidAuthFormControl(event.currentTarget)
      }
      onSubmit={submit}
    >
      {children}
    </Form>
  )
}

type AuthFormTextFieldProps = Omit<
  ComponentProps<typeof TextField>,
  "children" | "name" | "onBlur" | "onChange" | "value"
> & {
  description?: ReactNode
  inputProps?: Omit<ComponentProps<typeof Input>, "name">
  label: ReactNode
}

function AuthFormTextField({
  description,
  inputProps,
  label,
  ...props
}: AuthFormTextFieldProps) {
  const field = useFieldContext<string>()
  const isInvalid = isAuthFormFieldInvalid(field.state.meta)

  return (
    <TextField
      {...props}
      isInvalid={isInvalid || undefined}
      name={field.name}
      onBlur={field.handleBlur}
      onChange={field.handleChange}
      validationBehavior="aria"
      value={field.state.value}
    >
      <Label>{label}</Label>
      <Input {...inputProps} />
      {description ? <Description>{description}</Description> : null}
      <AuthFormFieldError />
    </TextField>
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
          aria-disabled={isDisabled || !canSubmit || isSubmitting || undefined}
          isDisabled={isDisabled || isSubmitting}
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
