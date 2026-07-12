import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { Text, View } from "react-native"
import { cn } from "../lib/cn"
import { useForm } from "./form"

export type FieldType = "text" | "email" | "password"

export interface FieldContextValue {
  value: string
  setValue: (value: string) => void
  error: string | undefined
  isDisabled: boolean
  type: FieldType
  autoComplete?: string
  name?: string
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
  name?: string
  type?: FieldType
  autoComplete?: string
  isDisabled?: boolean
  /** Controlled value (RN fields are always controlled — no FormData). */
  value?: string
  onChange?: (value: string) => void
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
  name,
  type = "text",
  autoComplete,
  isDisabled = false,
  value: valueProp,
  onChange,
  validate,
  className,
  children
}: TextFieldProps) {
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
    () => ({ value, setValue, error, isDisabled, type, autoComplete, name }),
    [value, setValue, error, isDisabled, type, autoComplete, name]
  )

  return (
    <FieldContext.Provider value={context}>
      <View className={cn("gap-1.5", className)}>{children}</View>
    </FieldContext.Provider>
  )
}

/** Field label. */
export function Label({
  className,
  children
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <Text className={cn("text-sm font-medium text-foreground", className)}>
      {children}
    </Text>
  )
}

/** Renders the active validation error of the enclosing `TextField`. */
export function FieldError({ className }: { className?: string }) {
  const { error } = useField()
  if (!error) return null
  return <Text className={cn("text-sm text-danger", className)}>{error}</Text>
}
