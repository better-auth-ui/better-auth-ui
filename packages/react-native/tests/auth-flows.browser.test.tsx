import { cleanup, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"
import { Auth } from "../src/components/auth/auth"
import { SignIn } from "../src/components/auth/sign-in"
import { DeviceAuthorization } from "../src/components/auth/device-authorization/device-authorization"
import { TwoFactorChallenge } from "../src/components/auth/two-factor/two-factor-challenge"
import { emailOtpPlugin } from "../src/lib/auth/email-otp-plugin"
import { deviceAuthorizationPlugin } from "../src/lib/auth/device-authorization-plugin"
import { twoFactorPlugin } from "../src/lib/auth/two-factor-plugin"
import { phoneNumberPlugin } from "../src/lib/auth/phone-number-plugin"
import { nativeApp } from "./support/native-app"

vi.mock("expo-clipboard", () => ({ setStringAsync: vi.fn() }))
vi.mock("expo-image-picker", () => ({ launchImageLibraryAsync: vi.fn() }))
vi.mock("expo-image-manipulator", () => ({
  manipulateAsync: vi.fn(),
  SaveFormat: { PNG: "png" }
}))
afterEach(cleanup)

it("validates an emailed code, locks resend during cooldown, and keeps the requested destination", async () => {
  const sendVerificationOtp = vi.fn(async () => ({}))
  const signInEmailOtp = vi.fn(async () => ({}))
  const app = nativeApp({
    plugins: [emailOtpPlugin()],
    params: { redirectTo: "/projects?tab=work" },
    client: {
      emailOtp: { sendVerificationOtp },
      signIn: { emailOtp: signInEmailOtp }
    }
  })
  app.render(<Auth view="emailOtp" />)
  const user = userEvent.setup()
  await user.type(
    screen.getByRole("textbox", { name: "Email" }),
    "  ada@example.com  "
  )
  await user.click(
    screen.getByRole("button", { name: "Send code", exact: true })
  )
  await waitFor(() =>
    expect(sendVerificationOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ada@example.com", type: "sign-in" })
    )
  )
  await screen.findByRole("textbox", { name: "Code", exact: true })
  expect(screen.getByRole("button", { name: /Resend in/ })).toHaveAttribute(
    "aria-disabled",
    "true"
  )
  await user.type(
    screen.getByRole("textbox", { name: "Code", exact: true }),
    "123"
  )
  await user.click(
    screen.getByRole("button", { name: "Verify code", exact: true })
  )
  expect(signInEmailOtp).not.toHaveBeenCalled()
  await user.type(
    screen.getByRole("textbox", { name: "Code", exact: true }),
    "456"
  )
  await user.click(
    screen.getByRole("button", { name: "Verify code", exact: true })
  )
  await waitFor(() =>
    expect(signInEmailOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ada@example.com", otp: "123456" })
    )
  )
  await waitFor(() =>
    expect(app.navigation.navigate).toHaveBeenCalledWith({
      to: "/projects?tab=work"
    })
  )
})

it("continues password sign-in through a server-requested second factor", async () => {
  const email = vi.fn(async () => ({
    twoFactorRedirect: true,
    twoFactorMethods: ["totp", "invalid"]
  }))
  const app = nativeApp({
    plugins: [twoFactorPlugin()],
    params: { redirectTo: "/projects" },
    client: { signIn: { email } }
  })
  app.render(<SignIn />)
  const user = userEvent.setup()
  await user.type(
    screen.getByRole("textbox", { name: "Email" }),
    "ada@example.com"
  )
  await user.type(
    screen.getByLabelText("Password", { exact: true }),
    "password"
  )
  await user.click(screen.getByRole("button", { name: "Sign In", exact: true }))
  await waitFor(() =>
    expect(app.navigation.push).toHaveBeenCalledWith("twoFactor", {
      params: { methods: "totp", redirectTo: "/projects" }
    })
  )
  expect(app.navigation.navigate).not.toHaveBeenCalled()
})

it("restricts challenge methods to server hints and validates before trusting a device", async () => {
  const verifyTotp = vi.fn(async () => ({}))
  const app = nativeApp({
    plugins: [twoFactorPlugin({ backupCodes: false })],
    params: { methods: "totp", redirectTo: "/account" },
    client: { twoFactor: { verifyTotp } }
  })
  app.render(<TwoFactorChallenge />)
  const user = userEvent.setup()
  expect(
    screen.queryByRole("button", { name: "Use an emailed code" })
  ).toBeNull()
  await user.type(
    screen.getByRole("textbox", { name: "Authenticator code", exact: true }),
    "123456"
  )
  await user.click(screen.getByRole("checkbox", { name: "Trust this device" }))
  await user.click(screen.getByRole("button", { name: "Verify", exact: true }))
  await waitFor(() =>
    expect(verifyTotp).toHaveBeenCalledWith(
      expect.objectContaining({ code: "123456", trustDevice: true })
    )
  )
  await waitFor(() =>
    expect(app.navigation.navigate).toHaveBeenCalledWith({ to: "/account" })
  )
})

it("preserves a device code through authentication without approving it", async () => {
  const verify = vi.fn(async () => ({ status: "pending" }))
  const app = nativeApp({
    plugins: [deviceAuthorizationPlugin({ path: "approve-device" })],
    params: { user_code: "ABCD-EFGH" },
    client: { device: verify }
  })
  app.render(<DeviceAuthorization />)
  await waitFor(() =>
    expect(app.navigation.push).toHaveBeenCalledWith(
      "signIn",
      expect.objectContaining({
        params: { redirectTo: expect.stringContaining("/auth/approve-device?") }
      })
    )
  )
  expect(app.navigation.push.mock.calls[0]?.[1]?.params?.redirectTo).toContain(
    "user_code=ABCDEFGH"
  )
  expect(verify).not.toHaveBeenCalled()
})

it("denies a verified device only after an explicit decision", async () => {
  const verifyUserCode = vi.fn(async () => ({ status: "pending" }))
  const approve = vi.fn(async () => ({}))
  const deny = vi.fn(async () => ({}))
  const app = nativeApp({
    authenticated: true,
    plugins: [deviceAuthorizationPlugin()],
    params: { user_code: "ABCDEFGH" },
    client: { device: Object.assign(verifyUserCode, { approve, deny }) }
  })
  app.render(<DeviceAuthorization />)
  await screen.findByRole("button", { name: "Deny", exact: true })
  expect(approve).not.toHaveBeenCalled()
  const user = userEvent.setup()
  await user.click(screen.getByRole("button", { name: "Deny", exact: true }))
  await waitFor(() =>
    expect(deny).toHaveBeenCalledWith(
      expect.objectContaining({ userCode: "ABCDEFGH" })
    )
  )
  await screen.findByText("Device Denied")
})

it("normalizes a phone number before requesting and verifying a code", async () => {
  const sendOtp = vi.fn(async () => ({}))
  const verify = vi.fn(async () => ({}))
  const app = nativeApp({
    plugins: [phoneNumberPlugin({ countries: ["US"] })],
    client: { phoneNumber: { sendOtp, verify } }
  })
  app.render(<Auth view="phoneNumber" />)
  const user = userEvent.setup()
  await user.type(
    screen.getByRole("textbox", { name: "Phone number", exact: true }),
    "2025550123"
  )
  await user.click(
    screen.getByRole("button", { name: "Send code", exact: true })
  )
  await waitFor(() =>
    expect(sendOtp).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: "+12025550123" })
    )
  )
  await user.type(
    await screen.findByRole("textbox", { name: "Phone code", exact: true }),
    "123456"
  )
  await user.click(
    screen.getByRole("button", { name: "Verify code", exact: true })
  )
  await waitFor(() =>
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: "+12025550123", code: "123456" })
    )
  )
})

it("recovers an unverified phone password sign-in through OTP without resubmitting the password", async () => {
  const signIn = vi.fn(async () => {
    throw Object.assign(new Error("Verify your phone"), {
      code: "PHONE_NUMBER_NOT_VERIFIED"
    })
  })
  const sendOtp = vi.fn(async () => ({})),
    verify = vi.fn(async () => ({}))
  const app = nativeApp({
    plugins: [phoneNumberPlugin({ countries: ["US"], passwordSignIn: true })],
    client: {
      signIn: { phoneNumber: signIn },
      phoneNumber: { sendOtp, verify }
    }
  })
  app.render(<Auth view="phoneNumber" />)
  const user = userEvent.setup()
  await user.click(
    screen.getByRole("button", { name: "Use a password", exact: true })
  )
  await user.type(
    screen.getByRole("textbox", { name: "Phone number", exact: true }),
    "2025550123"
  )
  await user.type(
    screen.getByLabelText("Password", { exact: true }),
    "secure-password"
  )
  await user.click(screen.getByRole("button", { name: "Sign In", exact: true }))
  await waitFor(() =>
    expect(sendOtp).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: "+12025550123" })
    )
  )
  await user.type(
    await screen.findByRole("textbox", { name: "Phone code", exact: true }),
    "123456"
  )
  await user.click(
    screen.getByRole("button", { name: "Verify code", exact: true })
  )
  await waitFor(() =>
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: "+12025550123", code: "123456" })
    )
  )
  expect(signIn).toHaveBeenCalledTimes(1)
})
