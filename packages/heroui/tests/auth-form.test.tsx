import {
  type AdditionalField,
  DEFAULT_ADDITIONAL_FIELD_VALIDATION_DEBOUNCE_MS
} from "@better-auth-ui/core"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  getAuthAdditionalFieldValidators,
  useAuthForm
} from "../src/components/auth/auth-form"

function TestAuthForm({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const form = useAuthForm({ defaultValues: {}, onSubmit })

  return (
    <form.AppForm>
      <form.AuthFormRoot>
        <form.AuthFormSubmitButton>Continue</form.AuthFormSubmitButton>
      </form.AuthFormRoot>
    </form.AppForm>
  )
}

function TestFieldForm({
  onSubmit
}: {
  onSubmit: (value: { email: string }) => Promise<void>
}) {
  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: ({ value }) => onSubmit(value)
  })

  return (
    <form.AppForm>
      <form.AuthFormRoot>
        <form.AppField
          name="email"
          validators={{
            onChange: ({ value }) => (value ? undefined : "Email is required")
          }}
        >
          {(field) => (
            <field.AuthFormTextField
              label="Email"
              inputProps={{ type: "email" }}
            />
          )}
        </form.AppField>
        <form.AuthFormServerError />
        <form.AuthFormSubmitButton>Continue</form.AuthFormSubmitButton>
      </form.AuthFormRoot>
    </form.AppForm>
  )
}

describe("AuthFormRoot", () => {
  it("rejects concurrent submission and disables the submit button", async () => {
    let finishSubmission!: () => void
    const submission = new Promise<void>((resolve) => {
      finishSubmission = resolve
    })
    const onSubmit = vi.fn(() => submission)
    const { container } = render(<TestAuthForm onSubmit={onSubmit} />)
    const form = container.querySelector("form")
    const submitButton = screen.getByRole("button", { name: /Continue/ })

    expect(form).not.toBeNull()
    fireEvent.submit(form as HTMLFormElement)
    fireEvent.submit(form as HTMLFormElement)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    await waitFor(() => expect(submitButton).toBeDisabled())

    finishSubmission()
    await waitFor(() => expect(submitButton).toBeEnabled())
  })

  it("keeps validation and rejected submission errors in TanStack state", async () => {
    const onSubmit = vi.fn(async () => {
      throw {
        body: {
          fieldErrors: { email: "This email cannot be used" },
          message: "Account creation failed"
        }
      }
    })
    render(<TestFieldForm onSubmit={onSubmit} />)
    const input = screen.getByRole("textbox", { name: "Email" })

    fireEvent.change(input, { target: { value: "ada@example.com" } })
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(await screen.findByText("This email cannot be used")).toBeVisible()
    expect(screen.getByText("Account creation failed")).toBeVisible()
  })
})

describe("additional field validation", () => {
  it("debounces custom validation and allows an explicit override", async () => {
    const validate = vi.fn()
    const field: AdditionalField = {
      label: "Handle",
      name: "handle",
      type: "string",
      validate
    }

    const validators = getAuthAdditionalFieldValidators(field, "Required")
    expect(validators.onChangeAsyncDebounceMs).toBe(
      DEFAULT_ADDITIONAL_FIELD_VALIDATION_DEBOUNCE_MS
    )
    await validators.onChangeAsync?.({ value: "ada" })
    expect(validate).toHaveBeenCalledWith("ada")

    expect(
      getAuthAdditionalFieldValidators(
        { ...field, validateDebounceMs: 0 },
        "Required"
      ).onChangeAsyncDebounceMs
    ).toBe(0)
  })
})
