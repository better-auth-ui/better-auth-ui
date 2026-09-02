import { getFormFieldErrorMessage } from "@better-auth-ui/core"
import { Button, FieldError, Form, Spinner } from "@heroui/react"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"
import type { ComponentProps, FormEvent, ReactNode } from "react"

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
  const message = isInvalid
    ? getFormFieldErrorMessage(field.state.meta.errors)
    : undefined

  return message ? <FieldError>{message}</FieldError> : null
}

type AuthFormRootProps = Omit<ComponentProps<typeof Form>, "onSubmit"> & {
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
    <Form
      {...props}
      onInvalid={(event) =>
        focusFirstInvalidAuthFormControl(event.currentTarget)
      }
      onSubmit={submit}
    >
      {children}
    </Form>
  )
}

function AuthFormSubmitButton({
  children,
  isDisabled,
  ...props
}: Omit<ComponentProps<typeof Button>, "children"> & { children?: ReactNode }) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting] as const}
    >
      {([canSubmit, isSubmitting]) => (
        <Button
          {...props}
          isDisabled={isDisabled || !canSubmit || isSubmitting}
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
