"use client"

import { getFormFieldErrors } from "@better-auth-ui/core"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"
import {
  type ComponentProps,
  createContext,
  type FormEvent,
  useContext,
  useRef,
  useState
} from "react"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
const AuthFormPreparationContext = createContext(false)

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

  if (!isInvalid) return null

  const errors = getFormFieldErrors(field.state.meta.errors)

  return errors.length > 0 ? <FieldError errors={errors} /> : null
}

type AuthFormRootProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  prepareSubmit?: (
    form: HTMLFormElement
  ) => boolean | undefined | Promise<boolean | undefined>
}

function AuthFormRoot({
  children,
  prepareSubmit,
  ...props
}: AuthFormRootProps) {
  const form = useFormContext()
  const preparingRef = useRef(false)
  const [isPreparing, setIsPreparing] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (preparingRef.current || form.state.isSubmitting) return

    const formElement = event.currentTarget
    preparingRef.current = true
    setIsPreparing(true)

    let shouldSubmit = true
    try {
      shouldSubmit = (await prepareSubmit?.(formElement)) !== false
    } finally {
      preparingRef.current = false
      setIsPreparing(false)
    }

    if (!shouldSubmit) return
    await form.handleSubmit()
    if (!form.state.isValid) focusFirstInvalidAuthFormControl(formElement)
  }

  return (
    <AuthFormPreparationContext.Provider value={isPreparing}>
      <form
        {...props}
        onInvalid={(event) =>
          focusFirstInvalidAuthFormControl(event.currentTarget)
        }
        onSubmit={submit}
      >
        {children}
      </form>
    </AuthFormPreparationContext.Provider>
  )
}

function AuthFormSubmitButton({
  children,
  disabled,
  ...props
}: ComponentProps<typeof Button>) {
  const form = useFormContext()
  const isPreparing = useContext(AuthFormPreparationContext)

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting] as const}
    >
      {([canSubmit, isSubmitting]) => (
        <Button
          {...props}
          disabled={disabled || isPreparing || !canSubmit || isSubmitting}
          type="submit"
        >
          {isPreparing || isSubmitting ? <Spinner /> : null}
          {children}
        </Button>
      )}
    </form.Subscribe>
  )
}

export const { useAppForm: useAuthForm } = createFormHook({
  fieldComponents: { AuthFormFieldError },
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
