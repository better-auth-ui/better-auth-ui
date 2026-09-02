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

function PendingAuthForm(props: {
  onSubmit: () => void
  prepareSubmit: () => Promise<boolean>
}) {
  const form = createAuthForm(() => ({
    defaultValues: {},
    onSubmit: props.onSubmit
  }))

  return (
    <form.AppForm>
      <form.AuthFormRoot prepareSubmit={props.prepareSubmit}>
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

  it("rejects concurrent preparation and exposes its pending state", async () => {
    let finishPreparation!: (result: boolean) => void
    const preparation = new Promise<boolean>((resolve) => {
      finishPreparation = resolve
    })
    const prepareSubmit = vi.fn(() => preparation)
    const onSubmit = vi.fn()
    const view = render(() => (
      <PendingAuthForm onSubmit={onSubmit} prepareSubmit={prepareSubmit} />
    ))
    const formElement = view.container.querySelector("form")
    const submitButton = view.getByRole("button", { name: /Submit/ })

    expect(formElement).not.toBeNull()
    fireEvent.submit(formElement as HTMLFormElement)
    fireEvent.submit(formElement as HTMLFormElement)

    expect(prepareSubmit).toHaveBeenCalledOnce()
    expect(submitButton).toBeDisabled()
    expect(view.getByRole("status", { name: "Loading" })).toBeInTheDocument()

    finishPreparation(true)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
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
