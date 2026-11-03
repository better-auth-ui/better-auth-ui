import {
  FieldApi,
  type AnyFormApi,
  useForm as useTanStackForm
} from "@tanstack/react-form"
import {
  createContext,
  type ReactNode,
  useContext,
  useCallback,
  useId,
  useRef
} from "react"
import { cn } from "../lib/cn"
import { Box } from "./styled"

function useCompatibilityForm(onSubmit?: () => void | Promise<void>) {
  return useTanStackForm({
    defaultValues: {} as Record<string, string>,
    onSubmit: async () => {
      await onSubmit?.()
    }
  })
}

type Validator = () => string | undefined | Promise<string | undefined>

interface FormContextValue {
  validationForm: AnyFormApi
  register: (validate: Validator) => () => void
  api?: ReturnType<typeof useCompatibilityForm>
  submit: () => Promise<void>
  isSubmitting: boolean
}

const FormContext = createContext<FormContextValue | null>(null)

/** Connect native submit buttons to the form that owns validation and values. */
export function NativeForm({
  children,
  className,
  validationForm,
  ...value
}: Omit<FormContextValue, "register"> & {
  validationForm: AnyFormApi
  children?: ReactNode
  className?: string
}) {
  const id = useId()
  const nextValidator = useRef(0)
  const register = useCallback(
    (validate: Validator) => {
      const field = new FieldApi({
        form: validationForm,
        name: `__nativeValidation-${id}-${nextValidator.current++}`,
        validators: { onSubmitAsync: async () => await validate() }
      })
      return field.mount()
    },
    [validationForm, id]
  )
  return (
    <FormContext.Provider value={{ ...value, register, validationForm }}>
      <Box className={cn(className)}>{children}</Box>
    </FormContext.Provider>
  )
}

/** Compatibility form for standalone native fields, backed by TanStack Form. */
export function Form({
  onSubmit,
  className,
  children
}: {
  onSubmit?: () => void | Promise<void>
  className?: string
  children?: ReactNode
}) {
  const api = useCompatibilityForm(onSubmit)
  return (
    <api.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <NativeForm
          api={api}
          validationForm={api}
          submit={() => api.handleSubmit()}
          isSubmitting={isSubmitting}
          className={className}
        >
          {children}
        </NativeForm>
      )}
    </api.Subscribe>
  )
}

export function useForm(): FormContextValue | null {
  return useContext(FormContext)
}
