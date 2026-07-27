import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AuthProvider } from "../src/components/auth/auth-provider"
import { ChangeEmailOtp } from "../src/components/auth/email-otp/change-email-otp"
import { EmailOtp } from "../src/components/auth/email-otp/email-otp"
import { ResetPasswordOtp } from "../src/components/auth/email-otp/reset-password-otp"
import { VerifyEmailOtp } from "../src/components/auth/email-otp/verify-email-otp"
import { emailOtpPlugin } from "../src/lib/auth/email-otp-plugin"

/** Minimal `authClient` shape the email-OTP views touch. */
function createMockAuthClient() {
  const sendVerificationOtp = vi.fn(async () => ({ success: true }))
  const signInEmailOtp = vi.fn(async () => ({ token: "session-token" }))
  const verifyEmail = vi.fn(async () => ({ status: true }))
  const requestEmailChange = vi.fn(async () => ({ success: true }))
  const changeEmail = vi.fn(async () => ({ success: true }))
  const resetPassword = vi.fn(async () => ({ success: true }))

  return {
    emailOtp: {
      sendVerificationOtp,
      verifyEmail,
      requestEmailChange,
      changeEmail,
      resetPassword
    },
    signIn: { emailOtp: signInEmailOtp },
    getSession: async () => ({
      user: { id: "user-1", email: "user@gmail.com", name: "User" },
      session: {}
    })
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"] & {
    emailOtp: {
      sendVerificationOtp: typeof sendVerificationOtp
      verifyEmail: typeof verifyEmail
      requestEmailChange: typeof requestEmailChange
      changeEmail: typeof changeEmail
      resetPassword: typeof resetPassword
    }
    signIn: { emailOtp: typeof signInEmailOtp }
  }
}

function renderWithProvider(
  children: React.ReactNode,
  options: Parameters<typeof emailOtpPlugin>[0] = {}
) {
  const authClient = createMockAuthClient()
  const navigate = vi.fn()

  return {
    authClient,
    navigate,
    ...render(
      <AuthProvider
        authClient={authClient}
        navigate={navigate}
        redirectTo="/dashboard"
        plugins={[emailOtpPlugin(options)]}
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
  await user.click(screen.getAllByRole("textbox")[0])
  await user.keyboard(code)
}

beforeEach(() => {
  sessionStorage.clear()
})

describe("<EmailOtp />", () => {
  it("sends a sign-in code, then exchanges it for a session", async () => {
    const user = userEvent.setup()
    const { authClient, navigate } = renderWithProvider(<EmailOtp />)

    await user.type(screen.getByLabelText(/email/i), "user@gmail.com")
    await user.click(screen.getByRole("button", { name: /send code/i }))

    await waitFor(() => {
      expect(authClient.emailOtp.sendVerificationOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "user@gmail.com",
          type: "sign-in"
        })
      )
    })

    expect(
      await screen.findByRole("link", { name: /open gmail/i })
    ).toBeInTheDocument()

    await typeCode(user, "123456")

    await waitFor(() => {
      expect(authClient.signIn.emailOtp).toHaveBeenCalledWith(
        expect.objectContaining({ email: "user@gmail.com", otp: "123456" })
      )
    })
    expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" })
  })

  it("returns to the email step without re-sending a code", async () => {
    const user = userEvent.setup()
    const { authClient } = renderWithProvider(<EmailOtp />)

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.click(screen.getByRole("button", { name: /send code/i }))

    await screen.findByRole("button", { name: /use a different email/i })
    await user.click(
      screen.getByRole("button", { name: /use a different email/i })
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(authClient.emailOtp.sendVerificationOtp).toHaveBeenCalledTimes(1)
  })
})

describe("<VerifyEmailOtp />", () => {
  it("verifies the stored address and continues to the redirect target", async () => {
    sessionStorage.setItem("better-auth-ui.verify-email", "user@gmail.com")

    const user = userEvent.setup()
    const { authClient, navigate } = renderWithProvider(<VerifyEmailOtp />, {
      emailVerification: true
    })

    expect(
      await screen.findByRole("link", { name: /open gmail/i })
    ).toBeInTheDocument()

    await typeCode(user, "654321")
    await waitFor(() => {
      expect(authClient.emailOtp.verifyEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: "user@gmail.com", otp: "654321" })
      )
    })
    expect(sessionStorage.getItem("better-auth-ui.verify-email")).toBeNull()
    expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" })
  })
})

describe("<ChangeEmailOtp />", () => {
  it("requests the change, then confirms it with the code from the new address", async () => {
    const user = userEvent.setup()
    const { authClient } = renderWithProvider(<ChangeEmailOtp />, {
      changeEmail: true
    })

    const emailField = await screen.findByLabelText(/email/i)
    await user.clear(emailField)
    await user.type(emailField, "new@gmail.com")
    await user.click(screen.getByRole("button", { name: /update email/i }))

    await waitFor(() => {
      expect(authClient.emailOtp.requestEmailChange).toHaveBeenCalledWith(
        expect.objectContaining({ newEmail: "new@gmail.com" })
      )
    })

    expect(
      await screen.findByRole("link", { name: /open gmail/i })
    ).toBeInTheDocument()

    await typeCode(user, "112233")

    await waitFor(() => {
      expect(authClient.emailOtp.changeEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          newEmail: "new@gmail.com",
          otp: "112233"
        })
      )
    })
  })

  it("confirms the current address first when the server verifies it", async () => {
    const user = userEvent.setup()
    const { authClient } = renderWithProvider(<ChangeEmailOtp />, {
      changeEmail: true,
      verifyCurrentEmail: true
    })

    const emailField = await screen.findByLabelText(/email/i)
    await user.clear(emailField)
    await user.type(emailField, "new@gmail.com")
    await user.click(screen.getByRole("button", { name: /update email/i }))

    await waitFor(() => {
      expect(authClient.emailOtp.sendVerificationOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "user@gmail.com",
          type: "change-email"
        })
      )
    })

    expect(
      await screen.findByRole("link", { name: /open gmail/i })
    ).toBeInTheDocument()

    await typeCode(user, "445566")

    await waitFor(() => {
      expect(authClient.emailOtp.requestEmailChange).toHaveBeenCalledWith(
        expect.objectContaining({
          newEmail: "new@gmail.com",
          otp: "445566"
        })
      )
    })
  })
})

describe("<ResetPasswordOtp />", () => {
  it("opens the inbox and submits once the form and code are complete", async () => {
    sessionStorage.setItem(
      "better-auth-ui.reset-password-otp",
      "user@gmail.com"
    )

    const user = userEvent.setup()
    const { authClient, navigate } = renderWithProvider(<ResetPasswordOtp />, {
      passwordReset: true
    })

    expect(
      await screen.findByRole("link", { name: /open gmail/i })
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/new password/i), "new-password")
    await typeCode(user, "778899")

    await waitFor(() => {
      expect(authClient.emailOtp.resetPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "user@gmail.com",
          otp: "778899",
          password: "new-password"
        })
      )
    })
    expect(
      sessionStorage.getItem("better-auth-ui.reset-password-otp")
    ).toBeNull()
    expect(navigate).toHaveBeenCalledWith({ to: "/auth/sign-in" })
  })
})
