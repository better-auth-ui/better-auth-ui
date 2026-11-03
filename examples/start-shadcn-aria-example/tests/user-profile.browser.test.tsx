import { type AuthClient, resolveAuthConfig } from "@better-auth-ui/core"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { UserProfile } from "../src/components/auth/settings/account/user-profile"

const authClient = {} as AuthClient
let config = resolveAuthConfig({ authClient })
const session = { user: { name: "Existing name", image: null } }
const updateUser = vi.fn().mockResolvedValue({})

vi.mock("@better-auth-ui/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@better-auth-ui/react")>()),
  useAuth: () => config,
  useSession: () => ({ data: session }),
  useUpdateUser: () => ({
    mutateAsync: updateUser,
    mutate: updateUser,
    isPending: false
  })
}))

beforeEach(() => {
  config = resolveAuthConfig({ authClient, avatar: { enabled: false } })
  updateUser.mockClear()
})
afterEach(cleanup)

describe("profile name configuration", () => {
  it("keeps profile editing independent of sign-up name collection", () => {
    config = resolveAuthConfig({
      authClient,
      avatar: { enabled: false },
      emailAndPassword: { name: false }
    })
    render(<UserProfile />)
    expect(screen.getByRole("textbox")).toHaveProperty(
      "value",
      session.user.name
    )
  })

  it("omits the disabled name when saving additional fields", async () => {
    config = resolveAuthConfig({
      authClient,
      avatar: { enabled: false },
      profile: { name: false },
      additionalFields: [{ name: "bio", label: "Biography", type: "string" }]
    })
    render(<UserProfile />)
    expect(screen.queryAllByRole("textbox")).toHaveLength(1)
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "New biography" }
    })
    fireEvent.click(
      screen.getByRole("button", {
        name: config.localization.settings.saveChanges
      })
    )
    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith({ bio: "New biography" })
    )
  })

  it("hides the entire card when only hidden or excluded fields remain", () => {
    config = resolveAuthConfig({
      authClient,
      avatar: { enabled: false },
      profile: { name: false },
      additionalFields: [
        {
          name: "internal",
          label: "Internal",
          type: "string",
          inputType: "hidden"
        },
        {
          name: "signup",
          label: "Sign-up only",
          type: "string",
          profile: false
        }
      ]
    })
    const { container } = render(<UserProfile />)
    expect(container.childElementCount).toBe(0)
    expect(updateUser).not.toHaveBeenCalled()
  })

  it("keeps avatar actions without an empty profile submit button", () => {
    config = resolveAuthConfig({ authClient, profile: { name: false } })
    const { container } = render(<UserProfile />)
    expect(container.childElementCount).toBeGreaterThan(0)
    expect(screen.queryByRole("textbox")).toBeNull()
    expect(container.querySelector('button[type="submit"]')).toBeNull()
  })
})
