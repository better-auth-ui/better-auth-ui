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
    {
      baseURL: "",
      configuredRedirectTo: "/dashboard",
      redirectOverride: undefined,
      callbackURL: "/dashboard"
    },
    {
      baseURL: "https://app.example.com",
      configuredRedirectTo: "/dashboard",
      redirectOverride: "/projects/acme?tab=members",
      callbackURL: "https://app.example.com/projects/acme?tab=members"
    },
    {
      baseURL: "https://app.example.com/",
      configuredRedirectTo: "projects/acme?tab=members#team",
      redirectOverride: undefined,
      callbackURL: "https://app.example.com/projects/acme?tab=members#team"
    },
    {
      baseURL: "https://app.example.com",
      configuredRedirectTo:
        "https://other.example.com/projects/acme?tab=members#team",
      redirectOverride: undefined,
      callbackURL: "https://other.example.com/projects/acme?tab=members#team"
    }
  ])(
    "sends the effective callback ($baseURL, $configuredRedirectTo, $redirectOverride)",
    async ({
      baseURL,
      configuredRedirectTo,
      redirectOverride,
      callbackURL
    }) => {
      const signUpEmail = vi.fn(async () => ({ data: {}, error: null }))
      const authClient = {
        getSession: vi.fn(async () => null),
        signUp: { email: signUpEmail }
      } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
      const navigate = vi.fn()
      const redirectTo = redirectOverride ?? configuredRedirectTo
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
          redirectTo={configuredRedirectTo}
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
          expect.objectContaining({ callbackURL })
        )
        expect(navigate).toHaveBeenCalledWith({
          to: `/auth/verify-email?redirectTo=${encodeURIComponent(redirectTo)}`
        })
      })
    }
  )
})
