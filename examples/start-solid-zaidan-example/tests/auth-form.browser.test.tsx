import { cleanup, fireEvent, render } from "@solidjs/testing-library"
import { afterEach, describe, expect, it, vi } from "vitest"

import { createAuthForm } from "../src/components/auth/auth-form"
import { OrganizationTableSelectRow } from "../src/components/auth/organization/organization-table-selection"

afterEach(cleanup)

function NativeValidationForm() {
  const form = createAuthForm(() => ({
    defaultValues: {},
    onSubmit: vi.fn()
  }))

  return (
    <form.AppForm>
      <form.AuthFormRoot>
        <input aria-label="First" required />
        <input aria-label="Second" required />
        <form.AuthFormSubmitButton>Submit</form.AuthFormSubmitButton>
      </form.AuthFormRoot>
    </form.AppForm>
  )
}

function PendingAuthForm(props: { onSubmit: () => Promise<void> }) {
  const form = createAuthForm(() => ({
    defaultValues: {},
    onSubmit: props.onSubmit
  }))

  return (
    <form.AppForm>
      <form.AuthFormRoot>
        <form.AuthFormSubmitButton>Submit</form.AuthFormSubmitButton>
      </form.AuthFormRoot>
    </form.AppForm>
  )
}

describe("Solid auth form", () => {
  it("captures native invalid events and focuses the first invalid control", async () => {
    const view = render(() => <NativeValidationForm />)
    const formElement = view.container.querySelector("form")
    const firstControl = view.getByLabelText("First")
    const focus = vi.spyOn(firstControl, "focus")

    expect(formElement).not.toBeNull()
    formElement?.requestSubmit()

    await vi.waitFor(() => expect(focus).toHaveBeenCalled())
    expect(document.activeElement).toBe(firstControl)
  })

  it("rejects concurrent submission and exposes its pending state", async () => {
    let finishSubmission!: () => void
    const submission = new Promise<void>((resolve) => {
      finishSubmission = resolve
    })
    const onSubmit = vi.fn(() => submission)
    const view = render(() => <PendingAuthForm onSubmit={onSubmit} />)
    const formElement = view.container.querySelector("form")
    const submitButton = view.getByRole("button", { name: /Submit/ })

    expect(formElement).not.toBeNull()
    fireEvent.submit(formElement as HTMLFormElement)
    fireEvent.submit(formElement as HTMLFormElement)

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    await vi.waitFor(() => expect(submitButton).toBeDisabled())
    expect(view.getByRole("status", { name: "Loading" })).toBeInTheDocument()

    finishSubmission()
    await vi.waitFor(() => expect(submitButton).toBeEnabled())
  })
})

describe("Solid organization table selection", () => {
  it("preserves Shift for keyboard range selection", () => {
    const toggleSelected = vi.fn()
    const view = render(() => (
      <OrganizationTableSelectRow
        localization={{ selectRow: "Select row" }}
        row={{
          getCanSelect: () => true,
          getIsSelected: () => false,
          getToggleSelectedHandler: () => toggleSelected
        }}
      />
    ))
    const checkboxGroup = view.getByRole("group", { name: "Select row" })
    const checkbox = view.container.querySelector<HTMLInputElement>(
      '[data-slot="checkbox-input"]'
    )

    expect(checkbox).not.toBeNull()
    fireEvent.keyDown(checkboxGroup, { key: " ", shiftKey: true })
    fireEvent.click(checkbox as HTMLInputElement)

    expect(toggleSelected).toHaveBeenCalledWith({
      shiftKey: true,
      target: { checked: true }
    })
  })
})
