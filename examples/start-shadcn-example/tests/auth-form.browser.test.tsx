import type { TablePersistenceAdapters } from "@better-auth-ui/core"
import "@testing-library/jest-dom/vitest"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  setAuthFormServerError,
  useAuthForm
} from "../src/components/auth/auth-form"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { useOrganizationTableState } from "../src/components/auth/organization/organization-table-state"
import { PhoneNumber } from "../src/components/auth/phone-number/phone-number"
import { useServerTableState } from "../src/components/auth/server-table-state"
import { EmailFirstSignIn } from "../src/components/auth/sso/email-first-sign-in"
import { phoneNumberPlugin } from "../src/lib/auth/phone-number-plugin"
import { ssoPlugin } from "../src/lib/auth/sso-plugin"

vi.mock("@/lib/auth/use-resend-cooldown", () => ({
  useResendCooldown: () => ({
    cooldown: 0,
    isCoolingDown: false,
    startCooldown: vi.fn()
  })
}))

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
      <button onClick={() => state.atoms.globalFilter.set("ada")} type="button">
        Filter users
      </button>
      <output aria-label="Server table state">
        {state.globalFilter}|{state.pagination.pageIndex}
      </output>
    </>
  )
}

function RouterTableStateFixture({
  adapters,
  stateKey = "router"
}: {
  adapters: TablePersistenceAdapters
  stateKey?: string
}) {
  const state = useOrganizationTableState(
    stateKey,
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

function createPhoneAuthClient() {
  const sendOtp = vi.fn(async () => ({ status: true }))
  const verify = vi.fn(async () => ({ token: "session-token" }))

  return {
    phoneNumber: { sendOtp, verify },
    signIn: { phoneNumber: vi.fn(async () => ({ token: "session-token" })) },
    getSession: async () => null
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    phoneNumber: {
      sendOtp: typeof sendOtp
      verify: typeof verify
    }
  }
}

function renderPhoneNumber() {
  const authClient = createPhoneAuthClient()

  return {
    authClient,
    ...render(
      <AuthProvider
        authClient={authClient}
        Link={({ children, href, to: _to, ...props }) => (
          <a href={href} {...props}>
            {children}
          </a>
        )}
        navigate={() => {}}
        plugins={[phoneNumberPlugin({ countries: ["US"] })]}
      >
        <PhoneNumber />
      </AuthProvider>
    )
  }
}

function renderEmailFirstSignIn(status: number) {
  const sso = vi.fn(async () => {
    throw Object.assign(new Error("SSO discovery failed"), { status })
  })
  const authClient = {
    signIn: { sso },
    useSession: () => ({ data: null, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    signIn: { sso: typeof sso }
  }

  return render(
    <AuthProvider
      authClient={authClient}
      Link={({ children, href, to: _to, ...props }) => (
        <a href={href} {...props}>
          {children}
        </a>
      )}
      navigate={() => {}}
      plugins={[ssoPlugin()]}
    >
      <EmailFirstSignIn />
    </AuthProvider>
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

    await waitFor(() => expect(submit).not.toHaveAttribute("aria-disabled"))
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

    fireEvent.change(email, { target: { value: "grace@example.com" } })
    await waitFor(() =>
      expect(screen.queryByText("Account creation failed")).toBeNull()
    )
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

  it("surfaces a rejected phone code resend in the form", async () => {
    const { authClient, container } = renderPhoneNumber()

    fireEvent.change(screen.getByRole("textbox", { name: "Phone number" }), {
      target: { value: "4155552671" }
    })
    fireEvent.click(screen.getByRole("button", { name: "Send code" }))
    await waitFor(() =>
      expect(authClient.phoneNumber.sendOtp).toHaveBeenCalled()
    )

    authClient.phoneNumber.sendOtp.mockRejectedValueOnce(
      new Error("Unable to resend the phone code")
    )
    fireEvent.click(screen.getByRole("button", { name: "Resend" }))

    const form = container.querySelector("form")
    expect(form).not.toBeNull()
    expect(
      await within(form as HTMLFormElement).findByText(
        "Unable to resend the phone code"
      )
    ).toBeVisible()
  })

  it("surfaces a rejected phone code verification in the form", async () => {
    const { authClient, container } = renderPhoneNumber()

    fireEvent.change(screen.getByRole("textbox", { name: "Phone number" }), {
      target: { value: "4155552671" }
    })
    fireEvent.click(screen.getByRole("button", { name: "Send code" }))
    await waitFor(() =>
      expect(authClient.phoneNumber.sendOtp).toHaveBeenCalled()
    )

    authClient.phoneNumber.verify.mockRejectedValueOnce(
      new Error("Unable to verify the phone code")
    )
    fireEvent.change(screen.getByRole("textbox", { name: "Phone code" }), {
      target: { value: "123456" }
    })

    const form = container.querySelector("form")
    expect(form).not.toBeNull()
    expect(
      await within(form as HTMLFormElement).findByText(
        "Unable to verify the phone code"
      )
    ).toBeVisible()
  })

  it("does not surface a handled missing SSO provider as a server error", async () => {
    renderEmailFirstSignIn(404)

    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "person@example.com" }
    })
    fireEvent.click(screen.getByRole("button", { name: "Continue with email" }))

    expect(
      await screen.findByText(
        "No organization sign-in was found. Choose another way to continue."
      )
    ).toBeVisible()
    expect(screen.queryByText("SSO discovery failed")).not.toBeInTheDocument()
  })

  it("surfaces an unexpected SSO discovery failure as a server error", async () => {
    renderEmailFirstSignIn(500)

    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "person@example.com" }
    })
    fireEvent.click(screen.getByRole("button", { name: "Continue with email" }))

    expect(await screen.findByText("SSO discovery failed")).toBeVisible()
  })
})

describe("shadcn TanStack server table state", () => {
  it("returns to the first page when a query input changes", async () => {
    render(<ServerTableStateFixture />)

    fireEvent.click(screen.getByRole("button", { name: "Go to page three" }))
    expect(screen.getByLabelText("Server table state")).toHaveTextContent("|2")

    fireEvent.click(screen.getByRole("button", { name: "Filter users" }))
    await waitFor(() =>
      expect(screen.getByLabelText("Server table state")).toHaveTextContent(
        "ada|0"
      )
    )
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

  it("restores before writing when the adapter and state key change", async () => {
    let firstParams = new URLSearchParams("first.search=alpha")
    let secondParams = new URLSearchParams("second.search=beta")
    let secondReplacements = 0
    const firstAdapters: TablePersistenceAdapters = {
      search: {
        read: () => new URLSearchParams(firstParams),
        replace: (next) => {
          firstParams = new URLSearchParams(next)
        },
        subscribe: () => () => {}
      }
    }
    const secondAdapters: TablePersistenceAdapters = {
      search: {
        read: () => new URLSearchParams(secondParams),
        replace: (next) => {
          secondReplacements += 1
          secondParams = new URLSearchParams(next)
        },
        subscribe: () => () => {}
      }
    }
    const { rerender } = render(
      <RouterTableStateFixture adapters={firstAdapters} stateKey="first" />
    )

    await waitFor(() =>
      expect(
        screen.getByRole("status", { name: "Restored table state" })
      ).toHaveTextContent("alpha||0")
    )

    rerender(
      <RouterTableStateFixture adapters={secondAdapters} stateKey="second" />
    )

    await waitFor(() =>
      expect(
        screen.getByRole("status", { name: "Restored table state" })
      ).toHaveTextContent("beta||0")
    )
    expect(secondReplacements).toBe(0)
    expect(secondParams.get("second.search")).toBe("beta")
  })
})
