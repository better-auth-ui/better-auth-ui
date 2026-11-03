import {
  useField as useTanStackField,
  type AnyFormApi
} from "@tanstack/react-form"
import {
  Children,
  isValidElement,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useId,
  useState
} from "react"
import { getFormFieldErrorMessage } from "@better-auth-ui/core"
import { cn } from "../lib/cn"
import { useForm } from "./form"
import { Box, Txt } from "./styled"

export type FieldType = "text" | "email" | "password" | "url"

export interface FieldContextValue {
  accessibilityLabel?: string
  labelId: string
  value: string
  setValue: (value: string) => void
  error: string | undefined
  isDisabled: boolean
  type: FieldType
  autoComplete?: string
  name?: string
  onBlur?: () => void
}

const FieldContext = createContext<FieldContextValue | null>(null)

/** Access the enclosing `TextField` context (used by `Input`/`InputGroup`/`FieldError`). */
export function useField(): FieldContextValue {
  const context = useContext(FieldContext)
  if (!context) {
    throw new Error(
      "[Better Auth UI] Input/Label/FieldError must be used within a TextField"
    )
  }
  return context
}

export interface TextFieldProps {
  accessibilityLabel?: string
  name?: string
  type?: FieldType
  autoComplete?: string
  isDisabled?: boolean
  /** Controlled value. Omit it to keep the value inside this field. */
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  error?: string
  /** Returns a localized error string, or `undefined` when valid. */
  validate?: (value: string) => string | undefined
  minLength?: number
  maxLength?: number
  className?: string
  children?: ReactNode
}

/** Adapt the legacy validate prop to TanStack Form for standalone consumers. */
export function TextField(props: TextFieldProps) {
  const form = useForm()
  const id = useId()
  if (props.validate && form) {
    return (
      <ValidatedTextField
        {...props}
        form={form.validationForm}
        fieldName={form.api ? (props.name ?? id) : `__nativeField-${id}`}
      />
    )
  }
  return <TextFieldRoot {...props} />
}

function ValidatedTextField({
  form,
  fieldName,
  ...props
}: TextFieldProps & { form: AnyFormApi; fieldName: string }) {
  const field = useTanStackField({
    form,
    name: fieldName,
    defaultValue: props.value ?? "",
    validators: { onChange: ({ value }) => props.validate?.(value) }
  })
  return <CompatibilityTextField field={field} {...props} />
}

function CompatibilityTextField({
  field,
  ...props
}: TextFieldProps & {
  field: {
    state: { value: string; meta: { isTouched: boolean; errors: unknown[] } }
    handleChange: (value: string) => void
    handleBlur: () => void
  }
}) {
  useEffect(() => {
    if (props.value !== undefined && props.value !== field.state.value)
      field.handleChange(props.value)
  }, [props.value, field])
  return (
    <TextFieldRoot
      {...props}
      value={props.value ?? field.state.value}
      onChange={(value) => {
        field.handleChange(value)
        props.onChange?.(value)
      }}
      onBlur={() => {
        field.handleBlur()
        props.onBlur?.()
      }}
      error={
        props.error ??
        (field.state.meta.isTouched
          ? getFormFieldErrorMessage(field.state.meta.errors)
          : undefined)
      }
    />
  )
}

function TextFieldRoot({
  accessibilityLabel,
  name,
  type = "text",
  autoComplete,
  isDisabled = false,
  value: valueProp,
  onChange,
  onBlur,
  error: externalError,
  validate: _validate,
  className,
  children
}: TextFieldProps) {
  const labelId = useId()
  const label = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type === Label
  )
  const labelText =
    accessibilityLabel ??
    (isValidElement<{ children?: ReactNode }>(label)
      ? nativeLabelText(label.props.children)
      : name)
  const isControlled = valueProp !== undefined
  const [internal, setInternal] = useState("")
  const value = isControlled ? valueProp : internal
  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next)
      onChange?.(next)
    },
    [isControlled, onChange]
  )

  const context = useMemo<FieldContextValue>(
    () => ({
      labelId,
      accessibilityLabel: labelText,
      value,
      setValue,
      error: externalError,
      isDisabled,
      type,
      autoComplete,
      name,
      onBlur
    }),
    [
      labelId,
      labelText,
      value,
      setValue,
      externalError,
      isDisabled,
      type,
      autoComplete,
      name,
      onBlur
    ]
  )

  return (
    <FieldContext.Provider value={context}>
      <Box className={cn("gap-1.5", className)}>{children}</Box>
    </FieldContext.Provider>
  )
}

/** Field label. */
export function Label({
  className,
  isDisabled,
  children
}: {
  className?: string
  isDisabled?: boolean
  children?: ReactNode
}) {
  const field = useContext(FieldContext)
  return (
    <Txt
      nativeID={field?.labelId}
      className={cn(
        "text-sm font-medium text-foreground",
        isDisabled && "opacity-50",
        className
      )}
    >
      {children}
    </Txt>
  )
}

/** Renders the active validation error of the enclosing `TextField`. */
export function FieldError({ className }: { className?: string }) {
  const { error } = useField()
  if (!error) return null
  return (
    <Txt
      accessibilityRole="alert"
      className={cn("text-sm text-danger", className)}
    >
      {error}
    </Txt>
  )
}

function nativeLabelText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? nativeLabelText(child.props.children)
          : ""
    )
    .join("")
}
