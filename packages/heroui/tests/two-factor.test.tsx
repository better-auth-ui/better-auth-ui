import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, assert, beforeEach, describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { SignIn } from "../src/components/auth/sign-in"
import { TwoFactorChallenge } from "../src/components/auth/two-factor/two-factor-challenge"
import { TwoFactorSettings } from "../src/components/auth/two-factor/two-factor-settings"
import { twoFactorPlugin } from "../src/lib/auth/two-factor-plugin"

type SignInResult = { twoFactorRedirect?: boolean; twoFactorMethods?: string[] }

/** Minimal `authClient` shape the two-factor views touch. */
function createMockAuthClient(signInResult: SignInResult = {}) {
  const signInEmail = vi.fn<() => Promise<SignInResult>>(() =>
    Promise.resolve(signInResult)
  )
  const sendOtp = vi.fn<() => Promise<{ status: boolean }>>(() =>
    Promise.resolve({
      status: true
    })
  )
  const verifyTotp = vi.fn<() => Promise<{ token: string }>>(() =>
    Promise.resolve({
      token: "session-token"
    })
  )
  const verifyOtp = vi.fn<() => Promise<{ token: string }>>(() =>
    Promise.resolve({
      token: "session-token"
    })
  )
  const verifyBackupCode = vi.fn<() => Promise<{ token: string }>>(() =>
    Promise.resolve({ token: "session-token" })
  )
  const enable = vi.fn<
    ({
      method
    }: {
      method?: "otp" | "totp"
    }) => Promise<
      | { method: "otp"; totpURI?: undefined; backupCodes?: undefined }
      | { method: "totp"; totpURI: string; backupCodes: string[] }
    >
  >(({ method }: { method?: "otp" | "totp" }) =>
    Promise.resolve(
      method === "otp"
        ? { method: "otp" as const }
        : {
            method: "totp" as const,
            totpURI:
              "otpauth://totp/App:user@example.com?secret=SECRET123&issuer=App",
            backupCodes: ["code-1", "code-2"]
          }
    )
  )

  return {
    signIn: { email: signInEmail },
    twoFactor: {
      sendOtp,
      verifyTotp,
      verifyOtp,
      verifyBackupCode,
      enable,
      disable: vi.fn<() => Promise<{ status: boolean }>>(() =>
        Promise.resolve({
          status: true
        })
      ),
      generateBackupCodes: vi.fn<() => Promise<{ backupCodes: string[] }>>(() =>
        Promise.resolve({ backupCodes: ["code-3"] })
      )
    },
    listAccounts: () => Promise.resolve([{ providerId: "credential" }]),
    getSession: () =>
      Promise.resolve({
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
  authClient = createMockAuthClient(),
  plugin = twoFactorPlugin()
) {
  const navigate = vi.fn<(...args: unknown[]) => void>()

  return {
    authClient,
    navigate,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={navigate}
        redirectTo="/dashboard"
        plugins={[plugin]}
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
  it("shows one spinner while email sign-in and form submission overlap", async () => {
    const user = userEvent.setup()
    let resolve!: (result: SignInResult) => void
    const promise = new Promise<SignInResult>((finish) => {
      resolve = finish
    })
    const authClient = createMockAuthClient()
    authClient.signIn.email.mockImplementation(() => promise)
    renderWithProvider(<SignIn />, authClient)

    await user.type(screen.getByLabelText(/email/iu), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/iu), "password123")
    const button = screen.getByRole("button", { name: /^sign in$/iu })
    await user.click(button)

    await waitFor(() => {
      expect(authClient.signIn.email).toHaveBeenCalledOnce()
    })
    expect(button.querySelectorAll('[data-slot="spinner"]')).toHaveLength(1)
    expect(button).toBeDisabled()

    resolve({})
    await waitFor(() => expect(button).toBeEnabled())
    expect(button.querySelectorAll('[data-slot="spinner"]')).toHaveLength(0)
  })

  it("routes to the challenge and stores the offered methods", async () => {
    const user = userEvent.setup()
    const { navigate } = renderWithProvider(
      <SignIn />,
      createMockAuthClient({
        twoFactorRedirect: true,
        twoFactorMethods: ["totp", "otp"]
      })
    )

    await user.type(screen.getByLabelText(/email/iu), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/iu), "password123")
    await user.click(screen.getByRole("button", { name: /^sign in$/iu }))

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

    await user.type(screen.getByLabelText(/email/iu), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/iu), "password123")
    await user.click(screen.getByRole("button", { name: /^sign in$/iu }))

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
      screen.getByRole("checkbox", { name: /trust this device/iu })
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

    await user.click(screen.getByRole("button", { name: /email me a code/iu }))

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

    await user.click(
      screen.getByRole("button", { name: /use a backup code/iu })
    )
    await user.type(screen.getByLabelText(/backup code/iu), "backup-1")
    await user.click(screen.getByRole("button", { name: /^verify$/iu }))

    await waitFor(() => {
      expect(authClient.twoFactor.verifyBackupCode).toHaveBeenCalledWith(
        expect.objectContaining({ code: "backup-1" })
      )
    })
  })
})

describe("<TwoFactorSettings />", () => {
  it("enables delivered-code two-factor without a TOTP verification step", async () => {
    const user = userEvent.setup()
    const { authClient } = renderWithProvider(
      <TwoFactorSettings />,
      createMockAuthClient(),
      twoFactorPlugin({ enrollmentMethods: ["totp", "otp"] })
    )

    const [enableButton] = screen.getAllByRole("button", {
      name: /enable two-factor/iu
    })

    assert.exists(enableButton)

    await user.click(enableButton)

    const dialog = await screen.findByRole("alertdialog")
    await user.click(
      within(dialog).getByRole("tab", { name: /email or sms code/iu })
    )
    await user.type(within(dialog).getByLabelText(/password/iu), "password123")
    await user.click(
      within(dialog).getByRole("button", { name: /enable two-factor/iu })
    )

    await waitFor(() => {
      expect(authClient.twoFactor.enable).toHaveBeenCalledWith(
        expect.objectContaining({ method: "otp", password: "password123" })
      )
    })
    expect(authClient.twoFactor.verifyTotp).not.toHaveBeenCalled()
  })

  it("auto-verifies enrollment codes before showing backup codes", async () => {
    const user = userEvent.setup()
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue()
    const { authClient } = renderWithProvider(<TwoFactorSettings />)

    const [enableButton] = screen.getAllByRole("button", {
      name: /enable two-factor/iu
    })

    assert.exists(enableButton)

    await user.click(enableButton)

    const dialog = await screen.findByRole("alertdialog")
    await user.type(within(dialog).getByLabelText(/password/iu), "password123")
    await user.click(
      within(dialog).getByRole("button", { name: /enable two-factor/iu })
    )

    await waitFor(() => {
      expect(authClient.twoFactor.enable).toHaveBeenCalledWith(
        expect.objectContaining({ method: "totp", password: "password123" })
      )
    })

    await user.click(
      within(dialog).getByRole("button", { name: /copy to clipboard/iu })
    )

    expect(writeText).toHaveBeenCalledWith("SECRET123")
    expect(
      within(dialog).getByRole("button", { name: /setup key copied/iu })
    ).toBeInTheDocument()

    await typeCode(user, "246810")

    await waitFor(() => {
      expect(authClient.twoFactor.verifyTotp).toHaveBeenCalledWith(
        expect.objectContaining({ code: "246810" })
      )
    })
    expect(await screen.findByText("code-1")).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole("button", { name: /copy to clipboard/iu })
    )

    expect(
      within(dialog).getByRole("button", { name: /backup codes copied/iu })
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

it.each([true, false])(
  "keeps server-issued recovery codes available when backup-code UI is disabled (codes returned: %s)",
  async (hasCodes) => {
    const user = userEvent.setup()
    const client = createMockAuthClient()
    if (!hasCodes)
      client.twoFactor.enable.mockResolvedValueOnce({
        method: "totp",
        totpURI:
          "otpauth://totp/App:user@example.com?secret=SECRET123&issuer=App",
        backupCodes: []
      })
    const { authClient } = renderWithProvider(
      <TwoFactorSettings />,
      client,
      twoFactorPlugin({ backupCodes: false })
    )
    const [enableButton] = screen.getAllByRole("button", {
      name: /enable two-factor/iu
    })
    assert.exists(enableButton)
    await user.click(enableButton)
    const dialog = await screen.findByRole("alertdialog")
    await user.type(within(dialog).getByLabelText(/password/iu), "password123")
    await user.click(
      within(dialog).getByRole("button", { name: /enable two-factor/iu })
    )
    await waitFor(() => {
      expect(authClient.twoFactor.enable).toHaveBeenCalledOnce()
    })
    await typeCode(user, "246810")
    await waitFor(() => {
      expect(authClient.twoFactor.verifyTotp).toHaveBeenCalledOnce()
    })
    if (hasCodes) {
      expect(await screen.findByText("code-1")).toBeInTheDocument()
    } else {
      await waitFor(() =>
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
      )
    }
  }
)

it("keeps the destination when email sign-in requires verification", async () => {
  const user = userEvent.setup()
  const authClient = createMockAuthClient()
  authClient.signIn.email.mockRejectedValueOnce({
    error: { code: "EMAIL_NOT_VERIFIED" }
  })
  const navigate = vi.fn<(...args: unknown[]) => void>()
  const target = "/invitations/accept?invite=abc"
  render(
    <AuthProvider
      authClient={authClient}
      navigate={navigate}
      redirectTo={target}
    >
      <SignIn />
    </AuthProvider>
  )
  await user.type(screen.getByLabelText(/^email$/iu), "user@example.com")
  await user.type(screen.getByLabelText(/^password$/iu), "password123")
  await user.click(screen.getByRole("button", { name: /^sign in$/iu }))
  await waitFor(() => {
    expect(navigate).toHaveBeenCalledWith({
      to: `/auth/verify-email?redirectTo=${encodeURIComponent(target)}`
    })
  })
})
