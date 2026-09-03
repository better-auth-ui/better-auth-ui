import type { TablePersistenceAdapters } from "@better-auth-ui/core"
import "@testing-library/jest-dom/vitest"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  setAuthFormServerError,
  useAuthForm
} from "../src/components/auth/auth-form"
import { useOrganizationTableState } from "../src/components/auth/organization/organization-table-state"

afterEach(cleanup)

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

function ValidatedAuthForm() {
  const form = useAuthForm({
    defaultValues: { email: "" },
    onSubmit: async () => {
      setAuthFormServerError(
        form,
        {
          fields: { email: "This email is already registered" },
          message: "Account creation failed"
        },
        "Fallback submission error"
      )
      throw new Error("Mutation rejected")
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
          {(field) => <field.AuthFormTextField label="Email" type="email" />}
        </form.AppField>
        <form.AuthFormSubmitButton>Continue</form.AuthFormSubmitButton>
        <form.AuthFormServerError />
      </form.AuthFormRoot>
    </form.AppForm>
  )
}

function RouterTableStateFixture({
  adapters
}: {
  adapters: TablePersistenceAdapters
}) {
  const state = useOrganizationTableState(
    "router",
    10,
    ["group", "name"],
    adapters
  )

  return (
    <>
      <button onClick={() => state.setGlobalFilter("local")} type="button">
        Set table search
      </button>
      <output aria-label="Restored table state">
        {state.ready
          ? `${state.globalFilter}|${state.sorting[0]?.id ?? ""}|${state.pagination.pageIndex}`
          : "loading"}
      </output>
    </>
  )
}

describe("shadcn TanStack form integration", () => {
  it("tracks the mutation promise and rejects concurrent submissions", async () => {
    let finishSubmission!: () => void
    const submission = new Promise<void>((resolve) => {
      finishSubmission = resolve
    })
    const onSubmit = vi.fn(() => submission)
    const { container } = render(<TestAuthForm onSubmit={onSubmit} />)
    const formElement = container.querySelector("form")
    const submit = screen.getByRole("button", { name: /Continue/ })

    expect(formElement).not.toBeNull()
    fireEvent.submit(formElement as HTMLFormElement)
    fireEvent.submit(formElement as HTMLFormElement)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    await waitFor(() => expect(submit).toBeDisabled())

    finishSubmission()
    await waitFor(() => expect(submit).toBeEnabled())
  })

  it("keeps invalid submission reachable and maps rejected server errors", async () => {
    render(<ValidatedAuthForm />)
    const email = screen.getByRole("textbox", { name: "Email" })
    const submit = screen.getByRole("button", { name: /Continue/ })

    fireEvent.change(email, { target: { value: "ada@example.com" } })
    fireEvent.change(email, { target: { value: "" } })

    await waitFor(() => expect(submit).toHaveAttribute("aria-disabled", "true"))
    expect(submit).not.toHaveAttribute("disabled")

    fireEvent.click(submit)
    expect(await screen.findByText("Email is required")).toBeVisible()
    await waitFor(() => expect(email).toHaveFocus())

    fireEvent.change(email, { target: { value: "ada@example.com" } })
    fireEvent.click(submit)

    expect(
      await screen.findByText("This email is already registered")
    ).toBeVisible()
    expect(screen.getByText("Account creation failed")).toBeVisible()
  })
})

describe("shadcn TanStack table state", () => {
  it("bounds URL replacements when the adapter notifies synchronously", async () => {
    let params = new URLSearchParams("router.search=first")
    let replacements = 0
    const listeners = new Set<() => void>()
    const adapters: TablePersistenceAdapters = {
      search: {
        read: () => new URLSearchParams(params),
        replace: (next) => {
          replacements += 1
          params = new URLSearchParams(next)
          for (const listener of listeners) listener()
        },
        subscribe: (listener) => {
          listeners.add(listener)
          return () => listeners.delete(listener)
        }
      }
    }

    render(<RouterTableStateFixture adapters={adapters} />)

    await waitFor(() =>
      expect(
        screen.getByRole("status", { name: "Restored table state" })
      ).toHaveTextContent("first||0")
    )
    fireEvent.click(screen.getByRole("button", { name: "Set table search" }))

    await waitFor(() =>
      expect(
        screen.getByRole("status", { name: "Restored table state" })
      ).toHaveTextContent("local||0")
    )
    expect(replacements).toBe(1)
    expect(params.get("router.search")).toBe("local")
  })
})
