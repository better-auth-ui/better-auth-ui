import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from "react"
import { cn } from "../lib/cn"
import { Box } from "./styled"

type Validator = () => string | undefined | Promise<string | undefined>

interface FormContextValue {
  /** Register a field validator; returns an unregister fn. */
  register: (validate: Validator) => () => void
  /** Run every registered validator; call `onSubmit` only if all pass. */
  submit: () => Promise<void>
  isSubmitting: boolean
}

const FormContext = createContext<FormContextValue | null>(null)

/**
 * React Native has no DOM `<form>`/`FormData`. This coordinator stands in:
 * `TextField`s register their validators, the submit `Button` calls
 * `submit()`, and `onSubmit` fires only when every field validates. Field
 * values live in the component's controlled state (not `FormData`).
 */
export function Form({
  onSubmit,
  className,
  children
}: {
  onSubmit?: () => void | Promise<void>
  className?: string
  children?: ReactNode
}) {
  const validators = useRef(new Set<Validator>())
  const submitting = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const register = useCallback((validate: Validator) => {
    validators.current.add(validate)
    return () => {
      validators.current.delete(validate)
    }
  }, [])

  const submit = useCallback(async () => {
    if (submitting.current) return
    submitting.current = true
    setIsSubmitting(true)
    try {
      const errors = await Promise.all(
        [...validators.current].map((validate) => validate())
      )
      if (errors.every((error) => !error)) await onSubmit?.()
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }, [onSubmit])

  const value = useMemo(
    () => ({ register, submit, isSubmitting }),
    [register, submit, isSubmitting]
  )

  return (
    <FormContext.Provider value={value}>
      <Box className={cn(className)}>{children}</Box>
    </FormContext.Provider>
  )
}

/** Access the enclosing `Form` coordinator (used by submit buttons + fields). */
export function useForm(): FormContextValue | null {
  return useContext(FormContext)
}
