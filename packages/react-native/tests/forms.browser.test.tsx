import { authQueryKeys, type AdditionalFields } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/react-query"
import { useStateNavigation } from "../src/navigation/state-adapter"
import { renderHook, act } from "@testing-library/react"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"
import { AuthProvider } from "../src/components/auth/auth-provider"
import { SignUp } from "../src/components/auth/sign-up"
import { UserProfile } from "../src/components/auth/settings/account/user-profile"
import { usernamePlugin } from "../src/lib/auth/username-plugin"

vi.mock("expo-clipboard", () => ({ setStringAsync: vi.fn() }))
vi.mock("expo-image-picker", () => ({ launchImageLibraryAsync: vi.fn() }))
vi.mock("expo-image-manipulator", () => ({
  manipulateAsync: vi.fn(),
  SaveFormat: { PNG: "png" }
}))

function harness(
  fields: AdditionalFields = [],
  plugins: Parameters<typeof AuthProvider>[0]["plugins"] = []
) {
  const signUp = vi.fn(async () => ({ data: {}, error: null }))
  const updateUser = vi.fn(async () => ({ data: {}, error: null }))
  const authClient = {
    signUp: { email: signUp },
    updateUser,
    getSession: async () =>
      queryClient.getQueryData(authQueryKeys.session) ?? null
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false }
    }
  })
  const navigation = {
    push: vi.fn(),
    current: () => undefined,
    getParam: () => undefined,
    navigate: vi.fn()
  }
  return {
    signUp,
    updateUser,
    queryClient,
    render: (children: React.ReactNode) =>
      render(
        <AuthProvider
          authClient={authClient}
          queryClient={queryClient}
          navigation={navigation}
          additionalFields={fields}
          plugins={plugins}
          avatar={false}
        >
          {children}
        </AuthProvider>
      )
  }
}

async function fillSignUp() {
  const user = userEvent.setup()
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada")
  await user.type(
    screen.getByRole("textbox", { name: "Email" }),
    "  ada@example.com  "
  )
  await user.type(
    screen.getByLabelText("Password", { exact: true }),
    "correct horse battery"
  )
  return user
}

afterEach(cleanup)

it("validates a required plugin username and submits its controlled value", async () => {
  const app = harness([], [usernamePlugin({ isUsernameAvailable: false })])
  app.render(<SignUp />)
  const user = await fillSignUp()
  await user.click(screen.getByRole("button", { name: "Sign Up", exact: true }))
  expect(app.signUp).not.toHaveBeenCalled()
  await user.type(screen.getByRole("textbox", { name: "Username" }), "ada")
  await user.click(screen.getByRole("button", { name: "Sign Up", exact: true }))
  await waitFor(() =>
    expect(app.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ username: "ada", email: "ada@example.com" })
    )
  )
})

it("awaits async validation, reports its error, and keeps hidden defaults while excluding read-only fields", async () => {
  let resolveValidation: ((value: void) => void) | undefined
  const validationGate = new Promise<void>((resolve) => {
    resolveValidation = resolve
  })
  const validate = vi.fn((value) =>
    value === "valid"
      ? validationGate
      : Promise.reject(new Error("Invalid invitation"))
  )
  const app = harness([
    {
      name: "invite",
      type: "string",
      label: "Invite",
      required: true,
      signUp: "above",
      validate,
      validateDebounceMs: 0
    },
    {
      name: "origin",
      type: "string",
      label: "Origin",
      inputType: "hidden",
      signUp: true,
      defaultValue: "native"
    },
    {
      name: "serverOnly",
      type: "string",
      label: "Server",
      signUp: true,
      defaultValue: "read-only",
      readOnly: true
    }
  ])
  app.render(<SignUp />)
  const user = await fillSignUp()
  await user.type(screen.getByRole("textbox", { name: "Invite" }), "bad")
  await user.click(screen.getByRole("button", { name: "Sign Up", exact: true }))
  await screen.findByText("Invalid invitation")
  expect(app.signUp).not.toHaveBeenCalled()
  await user.clear(screen.getByRole("textbox", { name: "Invite" }))
  await user.type(screen.getByRole("textbox", { name: "Invite" }), "valid")
  await user.click(screen.getByRole("button", { name: "Sign Up", exact: true }))
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Sign Up", exact: true })
    ).toHaveAttribute("aria-disabled", "true")
  )
  expect(app.signUp).not.toHaveBeenCalled()
  resolveValidation?.()
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Sign Up", exact: true })
    ).not.toHaveAttribute("aria-disabled", "true")
  )
  await user.click(screen.getByRole("button", { name: "Sign Up", exact: true }))
  await waitFor(() => expect(app.signUp).toHaveBeenCalled())
  const payload = app.signUp.mock.calls[0]?.[0]
  expect(payload).toEqual(
    expect.objectContaining({ invite: "valid", origin: "native" })
  )
  expect(payload).not.toHaveProperty("serverOnly")
})

it("reseeds profile fields from refreshed session data and excludes read-only values", async () => {
  const app = harness([
    { name: "title", type: "string", label: "Title" },
    { name: "level", type: "number", label: "Level", readOnly: true }
  ])
  const session = {
    session: { id: "session", userId: "user" },
    user: { id: "user", name: "Ada", title: "Engineer", level: 3 }
  }
  app.queryClient.setQueryData(authQueryKeys.session, session)
  app.render(<UserProfile />)
  const user = userEvent.setup()
  await waitFor(() =>
    expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue(
      "Engineer"
    )
  )
  await user.clear(screen.getByRole("textbox", { name: "Title" }))
  await user.type(screen.getByRole("textbox", { name: "Title" }), "Architect")
  await user.click(
    screen.getByRole("button", { name: "Save changes", exact: false })
  )
  await waitFor(() =>
    expect(app.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Architect" })
    )
  )
  expect(app.updateUser.mock.calls[0]?.[0]).not.toHaveProperty("level")
  app.queryClient.setQueryData(authQueryKeys.session, {
    ...session,
    user: { ...session.user, title: "Manager" }
  })
  await waitFor(() =>
    expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue(
      "Manager"
    )
  )
})

it("keeps parameters on the current state route while generating clean paths for another view", () => {
  const { result } = renderHook(() => useStateNavigation("signIn"))
  act(() => {
    result.current.configure?.({
      viewPaths: { auth: { oauthSelectAccount: "accounts/select" } }
    })
    result.current.push("signIn", {
      params: { token: "secret", redirectTo: "/settings/security" }
    })
  })
  expect(result.current.getPath?.()).toContain("token=secret")
  expect(
    result.current.getPath?.({ section: "auth", view: "oauthSelectAccount" })
  ).toBe("/auth/accounts/select")
})
