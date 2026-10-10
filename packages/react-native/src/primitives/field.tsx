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
  useRef,
  useState
} from "react"
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
  /** Controlled value (RN fields are always controlled — no FormData). */
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

/**
 * Controlled field wrapper mirroring the heroui `TextField`: owns value + error
 * state, exposes them via context to `Label` / `Input` / `InputGroup` /
 * `FieldError`, and registers its `validate` with the enclosing `Form` so the
 * submit button can trigger validation.
 */
export function TextField({
  accessibilityLabel,
  name,
  type = "text",
  autoComplete,
  isDisabled = false,
  value: valueProp,
  onChange,
  onBlur,
  error: externalError,
  validate,
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
  const form = useForm()
  const isControlled = valueProp !== undefined
  const [internal, setInternal] = useState("")
  const value = isControlled ? valueProp : internal
  const [error, setError] = useState<string | undefined>(undefined)

  const valueRef = useRef(value)
  valueRef.current = value
  const validateRef = useRef(validate)
  validateRef.current = validate
  const errorRef = useRef(error)
  errorRef.current = error

  // Register this field's validator with the Form; the submit button runs it.
  useEffect(() => {
    if (!form) return
    return form.register(() => {
      const next = validateRef.current?.(valueRef.current)
      setError(next)
      return next
    })
  }, [form])

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next)
      onChange?.(next)
      // Re-validate live once an error is already visible, to clear it promptly.
      if (errorRef.current) setError(validateRef.current?.(next))
    },
    [isControlled, onChange]
  )

  const context = useMemo<FieldContextValue>(
    () => ({
      labelId,
      accessibilityLabel: labelText,
      value,
      setValue,
      error: externalError ?? error,
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
      error,
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
