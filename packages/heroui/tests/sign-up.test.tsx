import { QueryClient } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { SignUp } from "../src/components/auth/sign-up"

function createMockAuthClient() {
  return {
    signUp: {
      email: vi.fn(async () => ({ data: {}, error: null }))
    },
    useSession: () => ({ data: null, isPending: false, error: null })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
}

function renderSignUp(optional: string) {
  return render(
    <AuthProvider
      additionalFields={[
        {
          name: "nickname",
          type: "string",
          label: "Nickname",
          signUp: true
        },
        {
          name: "inviteCode",
          type: "string",
          label: "Invite code",
          required: true,
          signUp: true
        },
        {
          name: "birthDate",
          type: "date",
          label: "Birth date",
          signUp: true
        }
      ]}
      authClient={createMockAuthClient()}
      localization={{ auth: { optional } }}
      navigate={() => {}}
      queryClient={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
          }
        })
      }
    >
      <SignUp />
    </AuthProvider>
  )
}

afterEach(() => {
  sessionStorage.clear()
  window.history.pushState({}, "", "/")
})

describe("<SignUp />", () => {
  it("preserves the redirect target when continuing to email verification", async () => {
    const user = userEvent.setup()
    const navigate = vi.fn()
    const redirectTo = "/projects/acme?tab=members"
    window.history.pushState(
      {},
      "",
      `/auth/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`
    )

    render(
      <AuthProvider
        authClient={createMockAuthClient()}
        emailAndPassword={{ requireEmailVerification: true }}
        navigate={navigate}
        queryClient={
          new QueryClient({
            defaultOptions: {
              queries: { retry: false },
              mutations: { retry: false }
            }
          })
        }
      >
        <SignUp />
      </AuthProvider>
    )

    await user.type(screen.getByLabelText("Name"), "Ada Lovelace")
    await user.type(screen.getByLabelText("Email"), "ada@example.com")
    await user.type(screen.getByLabelText("Password"), "correct horse battery")
    await user.click(screen.getByRole("button", { name: "Sign Up" }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        to: `/auth/verify-email?redirectTo=${encodeURIComponent(redirectTo)}`
      })
    })
  })

  it("labels optional additional fields without marking required fields", () => {
    renderSignUp(" [not required]")

    expect(screen.getByLabelText("Nickname [not required]")).not.toBeRequired()
    expect(screen.getByLabelText("Invite code")).toBeRequired()
    expect(
      screen.queryByLabelText("Invite code [not required]")
    ).not.toBeInTheDocument()
  })

  it("removes the optional indicator when its localization is empty", () => {
    renderSignUp("")

    expect(screen.getByLabelText("Nickname")).not.toBeRequired()
    expect(
      screen.queryByLabelText("Nickname (optional)")
    ).not.toBeInTheDocument()
  })

  it("uses the localized optional date label for the calendar", async () => {
    const user = userEvent.setup()
    renderSignUp(" [not required]")

    await user.click(
      screen.getByRole("button", {
        name: "Calendar Birth date [not required]"
      })
    )

    const calendar = await waitFor(() => {
      const element = document.querySelector('[data-slot="calendar"]')

      expect(element).toBeInTheDocument()
      return element
    })

    expect(calendar).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^Birth date \[not required\],/)
    )
  })
})
