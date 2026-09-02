import { getFormFieldErrors } from "@better-auth-ui/core"
import { createFormHook, createFormHookContexts } from "@tanstack/solid-form"
import {
  type Accessor,
  type ComponentProps,
  createContext,
  createSignal,
  Show,
  splitProps,
  useContext
} from "solid-js"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
const AuthFormPreparationContext = createContext<Accessor<boolean>>(() => false)

export function focusFirstInvalidAuthFormControl(form: HTMLFormElement) {
  requestAnimationFrame(() => {
    form
      .querySelector<HTMLElement>(
        '[aria-invalid="true"]:not([disabled]), :invalid:not([disabled])'
      )
      ?.focus()
  })
}

export function isAuthFormFieldInvalid({
  isTouched,
  isValid
}: {
  isTouched: boolean
  isValid: boolean
}) {
  return isTouched && !isValid
}

function AuthFormFieldError() {
  const field = useFieldContext<unknown>()
  const isInvalid = () => isAuthFormFieldInvalid(field().state.meta)
  const errors = () => getFormFieldErrors(field().state.meta.errors)

  return (
    <Show when={isInvalid() && errors().length > 0}>
      <FieldError errors={errors()} />
    </Show>
  )
}

type AuthFormRootProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  prepareSubmit?: (
    form: HTMLFormElement
  ) => boolean | undefined | Promise<boolean | undefined>
}

function AuthFormRoot(props: AuthFormRootProps) {
  const form = useFormContext()
  const [local, formProps] = splitProps(props, ["prepareSubmit"])
  const [isPreparing, setIsPreparing] = createSignal(false)
  let preparing = false

  const submit = async (event: SubmitEvent) => {
    event.preventDefault()
    if (preparing || form.state.isSubmitting) return

    const formElement = event.currentTarget as HTMLFormElement
    preparing = true
    setIsPreparing(true)

    let shouldSubmit = true
    try {
      shouldSubmit = (await local.prepareSubmit?.(formElement)) !== false
    } finally {
      preparing = false
      setIsPreparing(false)
    }

    if (!shouldSubmit) return
    await form.handleSubmit()
    if (!form.state.isValid) focusFirstInvalidAuthFormControl(formElement)
  }

  return (
    <AuthFormPreparationContext.Provider value={isPreparing}>
      <form
        {...formProps}
        on:invalid={{
          capture: true,
          handleEvent: (event) =>
            focusFirstInvalidAuthFormControl(event.currentTarget)
        }}
        onSubmit={submit}
      />
    </AuthFormPreparationContext.Provider>
  )
}

function AuthFormSubmitButton(
  props: Omit<ComponentProps<typeof Button>, "class"> & { class?: string }
) {
  const form = useFormContext()
  const isPreparing = useContext(AuthFormPreparationContext)

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting] as const}
    >
      {(state) => (
        <Button
          {...props}
          class={props.class}
          disabled={
            props.disabled || isPreparing() || !state()[0] || state()[1]
          }
          type="submit"
        >
          <Show when={isPreparing() || state()[1]}>
            <Spinner />
          </Show>
          {props.children}
        </Button>
      )}
    </form.Subscribe>
  )
}

export const { useAppForm: createAuthForm } = createFormHook({
  fieldComponents: { AuthFormFieldError },
  fieldContext,
  formComponents: { AuthFormRoot, AuthFormSubmitButton },
  formContext
})
