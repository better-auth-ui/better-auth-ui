import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef
} from "react"
import { cn } from "../lib/cn"
import { Box } from "./styled"

type Validator = () => string | undefined

interface FormContextValue {
  /** Register a field validator; returns an unregister fn. */
  register: (validate: Validator) => () => void
  /** Run every registered validator; call `onSubmit` only if all pass. */
  submit: () => void
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
  onSubmit?: () => void
  className?: string
  children?: ReactNode
}) {
  const validators = useRef(new Set<Validator>())

  const register = useCallback((validate: Validator) => {
    validators.current.add(validate)
    return () => {
      validators.current.delete(validate)
    }
  }, [])

  const submit = useCallback(() => {
    let ok = true
    for (const validate of validators.current) {
      if (validate()) ok = false
    }
    if (ok) onSubmit?.()
  }, [onSubmit])

  const value = useMemo(() => ({ register, submit }), [register, submit])

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
