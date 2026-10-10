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
  type AnyFormApi,
  createFormHook,
  createFormHookContexts
} from "@tanstack/react-form"
import type { ComponentProps, ReactNode } from "react"
import { Button } from "../../primitives/button"
import { TextField, Label, FieldError } from "../../primitives/field"
import { Form } from "../../primitives/form"
import { Input } from "../../primitives/input"
import { Txt } from "../../primitives/styled"
import { Description } from "../../primitives/description"
import { PasswordField } from "./password-field"
import { AdditionalField, type AdditionalFieldProps } from "./additional-field"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
const DEFAULT_AUTH_FORM_SERVER_ERROR = "Unable to submit this form. Try again."

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
  form.setErrorMap({ onServer: { fields: {} } })
}

export function clearAuthFormFieldServerError(
  form: AnyFormApi,
  fieldName: string
) {
  form.setErrorMap({ onServer: undefined })
  if (!fieldName) return

  const fieldMeta = form.getFieldMeta(fieldName as never)
  if (!fieldMeta?.errorMap.onServer) return

  form.setFieldMeta(fieldName as never, (current = fieldMeta) => ({
    ...current,
    errorMap: { ...current.errorMap, onServer: undefined },
    errorSourceMap: { ...current.errorSourceMap, onServer: undefined }
  }))
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

function AuthFormRoot({
  children,
  className,
  serverErrorMessage = DEFAULT_AUTH_FORM_SERVER_ERROR
}: {
  children?: ReactNode
  className?: string
  serverErrorMessage?: string
}) {
  const form = useFormContext()
  return (
    <Form
      className={className}
      onSubmit={async () => {
        await submitAuthForm(form, serverErrorMessage)
      }}
    >
      {children}
      <AuthFormServerError />
    </Form>
  )
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
        return message ? (
          <Txt accessibilityRole="alert" className="text-sm text-danger">
            {message}
          </Txt>
        ) : null
      }}
    </form.Subscribe>
  )
}

function AuthFormFieldError() {
  const field = useFieldContext<unknown>()
  const message = isAuthFormFieldInvalid(field.state.meta)
    ? getFormFieldErrorMessage(field.state.meta.errors)
    : undefined
  return message ? (
    <Txt accessibilityRole="alert" className="text-sm text-danger">
      {message}
    </Txt>
  ) : null
}

function AuthFormTextField({
  label,
  description,
  inputProps,
  ...props
}: Omit<
  ComponentProps<typeof TextField>,
  "name" | "value" | "onChange" | "onBlur" | "children"
> & {
  label: ReactNode
  description?: ReactNode
  inputProps?: ComponentProps<typeof Input>
}) {
  const field = useFieldContext<string>()
  const form = useFormContext()
  return (
    <TextField
      {...props}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(value) => {
        clearAuthFormFieldServerError(form, field.name)
        field.handleChange(value)
      }}
      error={
        isAuthFormFieldInvalid(field.state.meta)
          ? getFormFieldErrorMessage(field.state.meta.errors)
          : undefined
      }
    >
      <Label>{label}</Label>
      <Input {...inputProps} />
      {description ? <Description>{description}</Description> : null}
      <FieldError />
    </TextField>
  )
}

function AuthFormPasswordField(
  props: Omit<
    ComponentProps<typeof PasswordField>,
    "name" | "value" | "onChange" | "onBlur"
  >
) {
  const field = useFieldContext<string>()
  const form = useFormContext()
  return (
    <PasswordField
      {...props}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(value) => {
        clearAuthFormFieldServerError(form, field.name)
        field.handleChange(value)
      }}
      error={
        props.error ??
        (isAuthFormFieldInvalid(field.state.meta)
          ? getFormFieldErrorMessage(field.state.meta.errors)
          : undefined)
      }
    />
  )
}

function AuthFormAdditionalField(
  props: Omit<
    AdditionalFieldProps,
    "name" | "value" | "onChange" | "onBlur" | "errors" | "isInvalid"
  >
) {
  const field = useFieldContext<AdditionalFieldFormValue>()
  const form = useFormContext()
  const isInvalid = isAuthFormFieldInvalid(field.state.meta)
  return (
    <AdditionalField
      {...props}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(value) => {
        clearAuthFormFieldServerError(form, field.name)
        field.handleChange(value)
      }}
      isInvalid={isInvalid}
      errors={
        isInvalid ? getFormFieldErrors(field.state.meta.errors) : undefined
      }
    />
  )
}

function AuthFormSubmitButton(props: ComponentProps<typeof Button>) {
  const form = useFormContext()
  return (
    <form.Subscribe
      selector={(state) =>
        [
          state.isSubmitting,
          state.isFieldsValidating || state.isValidating
        ] as const
      }
    >
      {([isSubmitting, isValidating]) => (
        <Button
          {...props}
          type="submit"
          isPending={props.isPending || isSubmitting}
          isDisabled={props.isDisabled || isSubmitting || isValidating}
        />
      )}
    </form.Subscribe>
  )
}

export const {
  useAppForm: useAuthForm,
  withFieldGroup: withAuthFieldGroup,
  withForm: withAuthForm
} = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    AuthFormPasswordField,
    AuthFormAdditionalField,
    AuthFormTextField,
    AuthFormFieldError
  },
  formComponents: { AuthFormRoot, AuthFormSubmitButton, AuthFormServerError }
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
      (value instanceof Date && Number.isNaN(value.getTime())) ||
      (typeof value === "number" && !Number.isFinite(value))
        ? requiredMessage
        : validateAdditionalFieldRequired(field, value, requiredMessage),
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
