import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { SignIn } from "../src/components/auth/sign-in"
import { TwoFactorChallenge } from "../src/components/auth/two-factor/two-factor-challenge"
import { TwoFactorSettings } from "../src/components/auth/two-factor/two-factor-settings"
import { twoFactorPlugin } from "../src/lib/auth/two-factor-plugin"

type SignInResult = { twoFactorRedirect?: boolean; twoFactorMethods?: string[] }

/** Minimal `authClient` shape the two-factor views touch. */
function createMockAuthClient(signInResult: SignInResult = {}) {
  const signInEmail = vi.fn(async () => signInResult)
  const sendOtp = vi.fn(async () => ({ status: true }))
  const verifyTotp = vi.fn(async () => ({ token: "session-token" }))
  const verifyOtp = vi.fn(async () => ({ token: "session-token" }))
  const verifyBackupCode = vi.fn(async () => ({ token: "session-token" }))
  const enable = vi.fn(async () => ({
    totpURI: "otpauth://totp/App:user@example.com?secret=SECRET123&issuer=App",
    backupCodes: ["code-1", "code-2"]
  }))

  return {
    signIn: { email: signInEmail },
    twoFactor: {
      sendOtp,
      verifyTotp,
      verifyOtp,
      verifyBackupCode,
      enable,
      disable: vi.fn(async () => ({ status: true })),
      generateBackupCodes: vi.fn(async () => ({ backupCodes: ["code-3"] }))
    },
    listAccounts: async () => [{ providerId: "credential" }],
    getSession: async () => ({
      user: {
        id: "user-1",
        email: "user@example.com",
        name: "User",
        twoFactorEnabled: false
      },
      session: {}
    })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    signIn: { email: typeof signInEmail }
    twoFactor: {
      sendOtp: typeof sendOtp
      verifyTotp: typeof verifyTotp
      verifyOtp: typeof verifyOtp
      verifyBackupCode: typeof verifyBackupCode
      enable: typeof enable
    }
  }
}

function renderWithProvider(
  children: React.ReactNode,
  authClient = createMockAuthClient()
) {
  const navigate = vi.fn()

  return {
    authClient,
    navigate,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={navigate}
        redirectTo="/dashboard"
        plugins={[twoFactorPlugin()]}
      >
        {children}
      </AuthProvider>
    )
  }
}

async function typeCode(
  user: ReturnType<typeof userEvent.setup>,
  code: string
) {
  const input = screen
    .getAllByRole("textbox")
    .find((element) => !(element as HTMLInputElement).readOnly)

  if (!input) throw new Error("Expected an editable code input")

  await user.click(input)
  await user.keyboard(code)
}

beforeEach(() => {
  sessionStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("sign-in continuation", () => {
  it("routes to the challenge and stores the offered methods", async () => {
    const user = userEvent.setup()
    const { navigate } = renderWithProvider(
      <SignIn />,
      createMockAuthClient({
        twoFactorRedirect: true,
        twoFactorMethods: ["totp", "otp"]
      })
    )

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "password123")
    await user.click(screen.getByRole("button", { name: /^sign in$/i }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        to: "/auth/two-factor?redirectTo=%2Fdashboard"
      })
    })
    expect(sessionStorage.getItem("better-auth-ui.two-factor-methods")).toBe(
      '["totp","otp"]'
    )
  })

  it("redirects straight to the target when no second factor is pending", async () => {
    const user = userEvent.setup()
    const { navigate } = renderWithProvider(<SignIn />)

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "password123")
    await user.click(screen.getByRole("button", { name: /^sign in$/i }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" })
    })
  })
})

describe("<TwoFactorChallenge />", () => {
  it("auto-verifies an authenticator code with the trust-device choice", async () => {
    sessionStorage.setItem(
      "better-auth-ui.two-factor-methods",
      '["totp","otp"]'
    )

    const user = userEvent.setup()
    const { authClient, navigate } = renderWithProvider(<TwoFactorChallenge />)

    await user.click(
      screen.getByRole("checkbox", { name: /trust this device/i })
    )
    await typeCode(user, "123456")

    await waitFor(() => {
      expect(authClient.twoFactor.verifyTotp).toHaveBeenCalledWith(
        expect.objectContaining({ code: "123456", trustDevice: true })
      )
    })
    expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" })
    expect(
      sessionStorage.getItem("better-auth-ui.two-factor-methods")
    ).toBeNull()
  })

  it("requests an emailed code before auto-verifying it", async () => {
    sessionStorage.setItem("better-auth-ui.two-factor-methods", '["otp"]')

    const user = userEvent.setup()
    const { authClient } = renderWithProvider(<TwoFactorChallenge />)

    await user.click(screen.getByRole("button", { name: /email me a code/i }))

    await waitFor(() => {
      expect(authClient.twoFactor.sendOtp).toHaveBeenCalledTimes(1)
    })

    await typeCode(user, "999888")

    await waitFor(() => {
      expect(authClient.twoFactor.verifyOtp).toHaveBeenCalledWith(
        expect.objectContaining({ code: "999888" })
      )
    })
  })

  it("falls back to a backup code", async () => {
    sessionStorage.setItem("better-auth-ui.two-factor-methods", '["totp"]')

    const user = userEvent.setup()
    const { authClient } = renderWithProvider(<TwoFactorChallenge />)

    await user.click(screen.getByRole("button", { name: /use a backup code/i }))
    await user.type(screen.getByLabelText(/backup code/i), "backup-1")
    await user.click(screen.getByRole("button", { name: /^verify$/i }))

    await waitFor(() => {
      expect(authClient.twoFactor.verifyBackupCode).toHaveBeenCalledWith(
        expect.objectContaining({ code: "backup-1" })
      )
    })
  })
})

describe("<TwoFactorSettings />", () => {
  it("auto-verifies enrollment codes before showing backup codes", async () => {
    const user = userEvent.setup()
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue()
    const { authClient } = renderWithProvider(<TwoFactorSettings />)

    await user.click(screen.getByRole("button", { name: /enable two-factor/i }))

    const dialog = await screen.findByRole("alertdialog")
    await user.type(within(dialog).getByLabelText(/password/i), "password123")
    await user.click(
      within(dialog).getByRole("button", { name: /enable two-factor/i })
    )

    await waitFor(() => {
      expect(authClient.twoFactor.enable).toHaveBeenCalledWith(
        expect.objectContaining({ password: "password123" })
      )
    })

    await user.click(
      within(dialog).getByRole("button", { name: /copy to clipboard/i })
    )

    expect(writeText).toHaveBeenCalledWith("SECRET123")
    expect(
      within(dialog).getByRole("button", { name: /setup key copied/i })
    ).toBeInTheDocument()

    await typeCode(user, "246810")

    await waitFor(() => {
      expect(authClient.twoFactor.verifyTotp).toHaveBeenCalledWith(
        expect.objectContaining({ code: "246810" })
      )
    })
    expect(await screen.findByText("code-1")).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole("button", { name: /copy to clipboard/i })
    )

    expect(
      within(dialog).getByRole("button", { name: /backup codes copied/i })
    ).toBeInTheDocument()
    expect(writeText).toHaveBeenLastCalledWith(
      [
        `Backup codes for ${window.location.origin}`,
        "Save these somewhere safe. Each code works once if you lose your authenticator.",
        "",
        "code-1",
        "code-2"
      ].join("\n")
    )
  })
})
