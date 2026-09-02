import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useAuthForm } from "../src/components/auth/auth-form"

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
})
