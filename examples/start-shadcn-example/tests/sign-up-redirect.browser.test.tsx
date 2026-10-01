import { QueryClient } from "@tanstack/react-query"
import type { ComponentProps } from "react"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { SignUp } from "../src/components/auth/sign-up"

function Link(props: ComponentProps<"a">) {
  return <a {...props} />
}

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  window.history.pushState({}, "", "/")
})

describe("sign-up verification redirects", () => {
  it.each([
    { baseURL: "", redirectOverride: undefined },
    {
      baseURL: "https://app.example.com",
      redirectOverride: "/projects/acme?tab=members"
    }
  ])(
    "sends the effective callback ($baseURL, $redirectOverride)",
    async ({ baseURL, redirectOverride }) => {
      const signUpEmail = vi.fn(async () => ({ data: {}, error: null }))
      const authClient = {
        getSession: vi.fn(async () => null),
        signUp: { email: signUpEmail }
      } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
      const navigate = vi.fn()
      const redirectTo = redirectOverride ?? "/dashboard"
      window.history.pushState(
        {},
        "",
        redirectOverride
          ? `/auth/sign-up?redirectTo=${encodeURIComponent(redirectOverride)}`
          : "/auth/sign-up"
      )
      render(
        <AuthProvider
          authClient={authClient}
          baseURL={baseURL}
          redirectTo="/dashboard"
          emailAndPassword={{ requireEmailVerification: true }}
          Link={Link}
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
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { value: "Ada Lovelace" }
      })
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "ada@example.com" }
      })
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "correct horse battery" }
      })
      fireEvent.click(screen.getByRole("button", { name: "Sign Up" }))
      await waitFor(() => {
        expect(signUpEmail).toHaveBeenCalledWith(
          expect.objectContaining({ callbackURL: `${baseURL}${redirectTo}` })
        )
        expect(navigate).toHaveBeenCalledWith({
          to: `/auth/verify-email?redirectTo=${encodeURIComponent(redirectTo)}`
        })
      })
    }
  )
})
