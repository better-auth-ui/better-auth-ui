import { QueryClient } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

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

describe("<SignUp />", () => {
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
})
