import { getFormFieldErrorMessage } from "@better-auth-ui/core"
import { FieldError } from "@heroui/react"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"

const { fieldContext, formContext, useFieldContext } = createFormHookContexts()

function AuthFormFieldError() {
  const field = useFieldContext<unknown>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const message = isInvalid
    ? getFormFieldErrorMessage(field.state.meta.errors)
    : undefined

  return message ? <FieldError>{message}</FieldError> : null
}

export const { useAppForm: useAuthForm } = createFormHook({
  fieldComponents: { AuthFormFieldError },
  fieldContext,
  formComponents: {},
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
