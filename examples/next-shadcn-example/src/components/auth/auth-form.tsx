"use client"

import { getFormFieldErrors } from "@better-auth-ui/core"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"
import type { ComponentProps, FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    if ((await prepareSubmit?.(formElement)) === false) return
    await form.handleSubmit()
    if (!form.state.isValid) focusFirstInvalidAuthFormControl(formElement)
  }

  return (
    <form
      {...props}
      onInvalid={(event) =>
        focusFirstInvalidAuthFormControl(event.currentTarget)
      }
      onSubmit={submit}
    >
      {children}
    </form>
  )
}

function AuthFormSubmitButton({
  children,
  disabled,
  ...props
}: ComponentProps<typeof Button>) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting] as const}
    >
      {([canSubmit, isSubmitting]) => (
        <Button
          {...props}
          disabled={disabled || !canSubmit || isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Spinner /> : null}
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
