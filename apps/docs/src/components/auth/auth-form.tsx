"use client"

import type { FormFieldError as FormFieldErrorValue } from "@better-auth-ui/core"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"

import { FieldError } from "@/components/ui/field"

const { fieldContext, formContext, useFieldContext } = createFormHookContexts()

function AuthFormFieldError() {
  const field = useFieldContext<unknown>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  if (!isInvalid) return null

  return (
    <FieldError
      errors={field.state.meta.errors as Array<FormFieldErrorValue | undefined>}
    />
  )
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
