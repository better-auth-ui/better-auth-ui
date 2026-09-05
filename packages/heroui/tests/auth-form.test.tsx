import {
  type AdditionalField,
  DEFAULT_ADDITIONAL_FIELD_VALIDATION_DEBOUNCE_MS
} from "@better-auth-ui/core"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  getAuthAdditionalFieldValidators,
  setAuthFormServerError,
  useAuthForm
} from "../src/components/auth/auth-form"
import { useServerTableState } from "../src/components/auth/server-table-state"

function TestAuthForm({
  onSubmit,
  isPending
}: {
  onSubmit: () => Promise<void>
  isPending?: boolean
}) {
  const form = useAuthForm({ defaultValues: {}, onSubmit })

  return (
    <form.AppForm>
      <form.AuthFormRoot>
        <form.AuthFormSubmitButton isPending={isPending}>
          Continue
        </form.AuthFormSubmitButton>
      </form.AuthFormRoot>
    </form.AppForm>
  )
}

function TestFieldForm({
  mutationError,
  onSubmit
}: {
  mutationError?: unknown
  onSubmit: (value: { email: string }) => Promise<void>
}) {
  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      if (mutationError) {
        setAuthFormServerError(form, mutationError, "Fallback submission error")
      }
      await onSubmit(value)
    }
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

function AsyncValidatedAuthForm({
  validate
}: {
  validate: () => Promise<undefined>
}) {
  const form = useAuthForm({ defaultValues: { handle: "" } })

  return (
    <form.AppForm>
      <form.AppField
        name="handle"
        validators={{ onChangeAsync: validate, onChangeAsyncDebounceMs: 0 }}
      >
        {(field) => <field.AuthFormTextField label="Handle" />}
      </form.AppField>
    </form.AppForm>
  )
}

function MultiFieldServerErrorForm() {
  const form = useAuthForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async () => {
      setAuthFormServerError(
        form,
        {
          fields: {
            email: "Email is unavailable",
            password: "Password is compromised"
          },
          message: "Update the highlighted fields"
        },
        "Fallback submission error"
      )
    }
  })

  return (
    <form.AppForm>
      <form.AuthFormRoot>
        <form.AppField name="email">
          {(field) => <field.AuthFormTextField label="Email" />}
        </form.AppField>
        <form.AppField name="password">
          {(field) => <field.AuthFormTextField label="Password" />}
        </form.AppField>
        <form.AuthFormServerError />
        <form.AuthFormSubmitButton>Continue</form.AuthFormSubmitButton>
      </form.AuthFormRoot>
    </form.AppForm>
  )
}

function ServerTableStateFixture() {
  const state = useServerTableState({ pageSize: 10 })

  return (
    <>
      <button
        onClick={() => state.setPagination({ pageIndex: 2, pageSize: 10 })}
        type="button"
      >
        Go to page three
      </button>
      <button
        onClick={() => state.atoms.sorting.set([{ id: "name", desc: false }])}
        type="button"
      >
        Sort users
      </button>
      <output aria-label="Server table state">
        {state.sorting[0]?.id ?? "none"}|{state.pagination.pageIndex}
      </output>
    </>
  )
}

describe("AuthFormRoot", () => {
  it("shares one loading indicator across form and external pending transitions", async () => {
    let resolve!: () => void
    const promise = new Promise<void>((finish) => {
      resolve = finish
    })
    const onSubmit = vi.fn(() => promise)
    const view = render(<TestAuthForm onSubmit={onSubmit} isPending />)
    const button = view.getByRole("button", { name: /Continue/ })
    const spinners = () => button.querySelectorAll('[data-slot="spinner"]')

    expect(spinners()).toHaveLength(1)
    expect(button).toBeDisabled()
    view.rerender(<TestAuthForm onSubmit={onSubmit} isPending={false} />)
    expect(spinners()).toHaveLength(0)
    expect(button).toBeEnabled()

    fireEvent.click(button)
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(spinners()).toHaveLength(1)

    view.rerender(<TestAuthForm onSubmit={onSubmit} isPending />)
    expect(spinners()).toHaveLength(1)
    expect(button).toBeDisabled()

    view.rerender(<TestAuthForm onSubmit={onSubmit} isPending={false} />)
    expect(spinners()).toHaveLength(1)
    expect(button).toBeDisabled()

    resolve()
    await waitFor(() => expect(button).toBeEnabled())
    expect(spinners()).toHaveLength(0)
  })

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

    fireEvent.change(input, { target: { value: "grace@example.com" } })
    await waitFor(() =>
      expect(screen.queryByText("Account creation failed")).toBeNull()
    )
  })

  it("keeps an invalid submit action reachable so TanStack can reveal errors", async () => {
    const onSubmit = vi.fn(async () => undefined)
    render(<TestFieldForm onSubmit={onSubmit} />)
    const input = screen.getByRole("textbox", { name: "Email" })
    const submitButton = screen.getByRole("button", { name: /Continue/ })

    fireEvent.change(input, { target: { value: "ada@example.com" } })
    fireEvent.change(input, { target: { value: "" } })

    await waitFor(() =>
      expect(submitButton).not.toHaveAttribute("aria-disabled")
    )
    expect(submitButton).not.toHaveAttribute("disabled")

    fireEvent.click(submitButton)

    expect(await screen.findByText("Email is required")).toBeVisible()
    await waitFor(() => expect(input).toHaveFocus())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("preserves server errors set by a mutation error handler", async () => {
    render(
      <TestFieldForm
        mutationError={{
          fields: { email: "This password is compromised" },
          message: "Mutation-owned form error"
        }}
        onSubmit={async () => {
          throw new Error("Mutation rejected")
        }}
      />
    )
    const input = screen.getByRole("textbox", { name: "Email" })

    fireEvent.change(input, { target: { value: "ada@example.com" } })
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }))

    expect(
      await screen.findByText("This password is compromised")
    ).toBeVisible()
    expect(screen.getByText("Mutation-owned form error")).toBeVisible()
    expect(screen.queryByText("Mutation rejected")).toBeNull()
  })

  it("announces asynchronous field validation without blocking input", async () => {
    let finishValidation!: () => void
    const validate = vi.fn(
      () =>
        new Promise<undefined>((resolve) => {
          finishValidation = () => resolve(undefined)
        })
    )
    render(<AsyncValidatedAuthForm validate={validate} />)
    const input = screen.getByRole("textbox", { name: "Handle" })

    fireEvent.change(input, { target: { value: "ada" } })
    await waitFor(() => expect(input).toHaveAttribute("aria-busy", "true"))
    expect(input).toHaveValue("ada")

    finishValidation()
    await waitFor(() => expect(input).not.toHaveAttribute("aria-busy"))
  })

  it("preserves unrelated server field errors while editing", async () => {
    render(<MultiFieldServerErrorForm />)
    const email = screen.getByRole("textbox", { name: "Email" })
    const password = screen.getByRole("textbox", { name: "Password" })

    fireEvent.change(email, { target: { value: "ada@example.com" } })
    fireEvent.change(password, { target: { value: "password" } })
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }))

    expect(await screen.findByText("Email is unavailable")).toBeVisible()
    expect(screen.getByText("Password is compromised")).toBeVisible()
    expect(screen.getByText("Update the highlighted fields")).toBeVisible()

    fireEvent.change(password, { target: { value: "safer password" } })

    await waitFor(() =>
      expect(screen.queryByText("Password is compromised")).toBeNull()
    )
    expect(screen.getByText("Email is unavailable")).toBeVisible()
    expect(screen.queryByText("Update the highlighted fields")).toBeNull()
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

describe("HeroUI TanStack server table state", () => {
  it("returns to the first page when sorting changes", async () => {
    render(<ServerTableStateFixture />)

    fireEvent.click(screen.getByRole("button", { name: "Go to page three" }))
    expect(screen.getByLabelText("Server table state")).toHaveTextContent(
      "none|2"
    )

    fireEvent.click(screen.getByRole("button", { name: "Sort users" }))
    await waitFor(() =>
      expect(screen.getByLabelText("Server table state")).toHaveTextContent(
        "name|0"
      )
    )
  })
})
