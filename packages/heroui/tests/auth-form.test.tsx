import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useAuthForm } from "../src/components/auth/auth-form"

function TestAuthForm({
  onSubmit,
  prepareSubmit
}: {
  onSubmit: () => void
  prepareSubmit: () => Promise<boolean>
}) {
  const form = useAuthForm({ defaultValues: {}, onSubmit })

  return (
    <form.AppForm>
      <form.AuthFormRoot prepareSubmit={prepareSubmit}>
        <form.AuthFormSubmitButton>Continue</form.AuthFormSubmitButton>
      </form.AuthFormRoot>
    </form.AppForm>
  )
}

describe("AuthFormRoot", () => {
  it("rejects concurrent preparation and disables submission while pending", async () => {
    let finishPreparation!: (result: boolean) => void
    const preparation = new Promise<boolean>((resolve) => {
      finishPreparation = resolve
    })
    const prepareSubmit = vi.fn(() => preparation)
    const onSubmit = vi.fn()
    const { container } = render(
      <TestAuthForm onSubmit={onSubmit} prepareSubmit={prepareSubmit} />
    )
    const form = container.querySelector("form")
    const submitButton = screen.getByRole("button", { name: /Continue/ })

    expect(form).not.toBeNull()
    fireEvent.submit(form as HTMLFormElement)
    fireEvent.submit(form as HTMLFormElement)

    expect(prepareSubmit).toHaveBeenCalledOnce()
    expect(submitButton).toBeDisabled()

    finishPreparation(true)
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
  })
})
