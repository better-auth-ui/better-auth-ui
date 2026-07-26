import { render } from "@solidjs-email/main"
import { describe, expect, it } from "vitest"
import {
  ChangeEmailConfirmationEmail,
  DeleteAccountVerificationEmail,
  EmailChangedEmail,
  EmailVerificationEmail,
  MagicLinkEmail,
  NewDeviceEmail,
  OrganizationInvitationEmail,
  OtpEmail,
  PasswordChangedEmail,
  ResetPasswordEmail
} from "../src/email"

describe("Solid email templates", () => {
  it("renders EmailVerificationEmail with key content and links", async () => {
    const html = await render(() => (
      <EmailVerificationEmail
        appName="Better Auth UI"
        darkMode
        email="user@example.com"
        expirationMinutes={60}
        logoURL={{
          light: "https://example.com/logo-light.png",
          dark: "https://example.com/logo-dark.png"
        }}
        poweredBy
        url="https://example.com/auth/verify-email"
      />
    ))

    expect(html).toContain("Verify email address")
    expect(html).toContain("user@example.com")
    expect(html).toContain("Better Auth UI")
    expect(html).toContain("https://example.com/auth/verify-email")
    expect(html).toContain("https://example.com/logo-light.png")
    expect(html).toContain("https://example.com/logo-dark.png")
    expect(html).toContain("This link expires in 60 minutes")
    expect(html).toContain("Powered by")
    expect(html).toContain("font-family: Arial, Helvetica, sans-serif")
    expect(html).toContain("font-family:Arial, Helvetica, sans-serif")
    expect(html).not.toContain("font-family:ui-sans-serif")
  })

  it("applies EmailVerificationEmail localization overrides", async () => {
    const html = await render(() => (
      <EmailVerificationEmail
        localization={{
          VERIFY_EMAIL_ADDRESS: "Confirm address",
          OR_COPY_AND_PASTE_URL: "Manual link:"
        }}
        url="https://example.com/confirm-address"
      />
    ))

    expect(html).toContain("Confirm address")
    expect(html).toContain("Manual link:")
    expect(html).toContain("https://example.com/confirm-address")
  })

  it("renders MagicLinkEmail with key content and links", async () => {
    const html = await render(() => (
      <MagicLinkEmail
        appName="Better Auth UI"
        darkMode
        email="user@example.com"
        expirationMinutes={5}
        poweredBy
        url="https://example.com/auth/magic-link"
      />
    ))

    expect(html).toContain("Sign in to Better Auth UI")
    expect(html).toContain("user@example.com")
    expect(html).toContain("https://example.com/auth/magic-link")
    expect(html).toContain("This link expires in 5 minutes")
    expect(html).toContain("Powered by")
  })

  it("applies MagicLinkEmail localization overrides", async () => {
    const html = await render(() => (
      <MagicLinkEmail
        localization={{
          SIGN_IN_TO_YOUR_ACCOUNT: "Access your account",
          OR_COPY_AND_PASTE_URL: "Manual magic link:"
        }}
        url="https://example.com/access"
      />
    ))

    expect(html).toContain("Access your account")
    expect(html).toContain("Manual magic link:")
    expect(html).toContain("https://example.com/access")
  })

  it("renders ResetPasswordEmail with key content and links", async () => {
    const html = await render(() => (
      <ResetPasswordEmail
        appName="Better Auth UI"
        darkMode
        email="user@example.com"
        expirationMinutes={60}
        poweredBy
        url="https://example.com/auth/reset-password"
      />
    ))

    expect(html).toContain("Reset your password")
    expect(html).toContain("Better Auth UI")
    expect(html).toContain("user@example.com")
    expect(html).toContain("https://example.com/auth/reset-password")
    expect(html).toContain("This link expires in 60 minutes")
    expect(html).toContain("Your password will remain unchanged")
  })

  it("applies ResetPasswordEmail localization overrides", async () => {
    const html = await render(() => (
      <ResetPasswordEmail
        localization={{
          RESET_YOUR_PASSWORD: "Choose a new password",
          RESET_PASSWORD: "Continue reset",
          OR_COPY_AND_PASTE_URL: "Manual reset link:"
        }}
        url="https://example.com/reset"
      />
    ))

    expect(html).toContain("Choose a new password")
    expect(html).toContain("Continue reset")
    expect(html).toContain("Manual reset link:")
    expect(html).toContain("https://example.com/reset")
  })

  it("renders the current-address approval step for an email change", async () => {
    const html = await render(() => (
      <ChangeEmailConfirmationEmail
        appName="Better Auth UI"
        currentEmail="current@example.com"
        expirationMinutes={30}
        newEmail="new@example.com"
        url="https://example.com/auth/approve-email-change"
      />
    ))

    expect(html).toContain("Confirm your email change")
    expect(html).toContain("Current email:")
    expect(html).toContain("current@example.com")
    expect(html).toContain("New email:")
    expect(html).toContain("new@example.com")
    expect(html).toContain("https://example.com/auth/approve-email-change")
    expect(html).toContain("This link expires in 30 minutes")
    expect(html).toContain("Email sent by Better Auth UI.")
    expect(html).toContain("Your email address will stay the same")
  })

  it("applies ChangeEmailConfirmationEmail localization overrides", async () => {
    const html = await render(() => (
      <ChangeEmailConfirmationEmail
        appName="Better Auth UI"
        localization={{
          CONFIRM_EMAIL_CHANGE: "Approve address update",
          APPROVE_EMAIL_CHANGE: "Confirm update",
          EMAIL_SENT_BY: "Delivered by {appName}."
        }}
        url="https://example.com/auth/confirm-email-update"
      />
    ))

    expect(html).toContain("Approve address update")
    expect(html).toContain("Confirm update")
    expect(html).toContain("Delivered by Better Auth UI.")
    expect(html).toContain("https://example.com/auth/confirm-email-update")
  })

  it("renders the irreversible account deletion verification step", async () => {
    const html = await render(() => (
      <DeleteAccountVerificationEmail
        appName="Better Auth UI"
        email="user@example.com"
        expirationHours={12}
        url="https://example.com/auth/verify-account-deletion"
      />
    ))

    expect(html).toContain("Confirm account deletion")
    expect(html).toContain("user@example.com")
    expect(html).toContain("This action cannot be undone")
    expect(html).toContain("Delete my account")
    expect(html).toContain("https://example.com/auth/verify-account-deletion")
    expect(html).toContain("This link expires in 12 hours")
    expect(html).toContain("Email sent by Better Auth UI.")
    expect(html).toContain("Your account will remain active")
  })

  it("applies DeleteAccountVerificationEmail localization overrides", async () => {
    const html = await render(() => (
      <DeleteAccountVerificationEmail
        appName="Better Auth UI"
        localization={{
          CONFIRM_ACCOUNT_DELETION: "Verify account removal",
          DELETE_MY_ACCOUNT: "Permanently remove account",
          EMAIL_SENT_BY: "Delivered by {appName}."
        }}
        url="https://example.com/auth/confirm-account-removal"
      />
    ))

    expect(html).toContain("Verify account removal")
    expect(html).toContain("Permanently remove account")
    expect(html).toContain("Delivered by Better Auth UI.")
    expect(html).toContain("https://example.com/auth/confirm-account-removal")
  })

  it("renders PasswordChangedEmail with key security content", async () => {
    const html = await render(() => (
      <PasswordChangedEmail
        appName="Better Auth UI"
        darkMode
        email="user@example.com"
        poweredBy
        secureAccountURL="https://example.com/settings/security"
        supportEmail="support@example.com"
        timestamp="February 10, 2025 at 4:20 PM UTC"
      />
    ))

    expect(html).toContain("Password changed successfully")
    expect(html).toContain("Better Auth UI")
    expect(html).toContain("user@example.com")
    expect(html).toContain("February 10, 2025 at 4:20 PM UTC")
    expect(html).toContain("https://example.com/settings/security")
    expect(html).toContain("support@example.com")
    expect(html).toContain("Your account is secure")
  })

  it("applies PasswordChangedEmail localization overrides", async () => {
    const html = await render(() => (
      <PasswordChangedEmail
        localization={{
          PASSWORD_CHANGED_SUCCESSFULLY: "Secret changed",
          CHANGED_AT: "When",
          I_DIDNT_MAKE_THIS_CHANGE: "Secure my account"
        }}
        secureAccountURL="https://example.com/secure"
        timestamp="Today"
      />
    ))

    expect(html).toContain("Secret changed")
    expect(html).toContain("When")
    expect(html).toContain("Secure my account")
    expect(html).toContain("https://example.com/secure")
  })

  it("renders EmailChangedEmail with old and new email details", async () => {
    const html = await render(() => (
      <EmailChangedEmail
        appName="Better Auth UI"
        darkMode
        newEmail="new@example.com"
        oldEmail="old@example.com"
        poweredBy
        revertURL="https://example.com/auth/revert-email"
        supportEmail="support@example.com"
      />
    ))

    expect(html).toContain("Email address changed")
    expect(html).toContain("Better Auth UI")
    expect(html).toContain("Previous email:")
    expect(html).toContain("old@example.com")
    expect(html).toContain("New email:")
    expect(html).toContain("new@example.com")
    expect(html).toContain("https://example.com/auth/revert-email")
    expect(html).toContain("support@example.com")
  })

  it("applies EmailChangedEmail localization overrides", async () => {
    const html = await render(() => (
      <EmailChangedEmail
        localization={{
          EMAIL_ADDRESS_CHANGED: "Address updated",
          PREVIOUS_EMAIL: "Before:",
          NEW_EMAIL: "After:",
          I_DIDNT_MAKE_THIS_CHANGE: "Undo change"
        }}
        newEmail="after@example.com"
        oldEmail="before@example.com"
        revertURL="https://example.com/undo"
      />
    ))

    expect(html).toContain("Address updated")
    expect(html).toContain("Before:")
    expect(html).toContain("After:")
    expect(html).toContain("Undo change")
    expect(html).toContain("https://example.com/undo")
  })

  it("renders OtpEmail with verification code content", async () => {
    const html = await render(() => (
      <OtpEmail
        appName="Better Auth UI"
        darkMode
        email="user@example.com"
        expirationMinutes={10}
        poweredBy
        verificationCode="069420"
      />
    ))

    expect(html).toContain("Verify your email")
    expect(html).toContain("069420")
    expect(html).toContain("user@example.com")
    expect(html).toContain("Better Auth UI")
    expect(html).toContain("This code expires in 10 minutes")
    expect(html).toContain("Powered by")
  })

  it("applies OtpEmail localization overrides", async () => {
    const html = await render(() => (
      <OtpEmail
        localization={{
          VERIFY_YOUR_EMAIL: "Confirm your code",
          THIS_CODE_EXPIRES_IN_MINUTES: "Code expires in {expirationMinutes}m."
        }}
        expirationMinutes={3}
        verificationCode="123456"
      />
    ))

    expect(html).toContain("Confirm your code")
    expect(html).toContain("123456")
    expect(html).toContain("Code expires in 3m.")
  })

  it("renders NewDeviceEmail with device details", async () => {
    const html = await render(() => (
      <NewDeviceEmail
        appName="Better Auth UI"
        darkMode
        deviceInfo={{
          browser: "Chrome on macOS",
          ipAddress: "127.0.0.1",
          location: "Buenos Aires, Argentina",
          os: "macOS 26.2",
          timestamp: "February 10, 2025 at 4:20 PM UTC"
        }}
        poweredBy
        secureAccountLink="https://example.com/auth/secure-account"
        supportEmail="support@example.com"
        userEmail="user@example.com"
      />
    ))

    expect(html).toContain("New sign-in detected")
    expect(html).toContain("user@example.com")
    expect(html).toContain("Device details")
    expect(html).toContain("Chrome on macOS")
    expect(html).toContain("macOS 26.2")
    expect(html).toContain("Buenos Aires, Argentina")
    expect(html).toContain("127.0.0.1")
    expect(html).toContain("https://example.com/auth/secure-account")
    expect(html).toContain("support@example.com")
  })

  it("applies NewDeviceEmail localization overrides", async () => {
    const html = await render(() => (
      <NewDeviceEmail
        deviceInfo={{ browser: "Firefox" }}
        localization={{
          NEW_SIGN_IN_DETECTED: "Unknown login",
          DEVICE_DETAILS: "Login details",
          SECURE_MY_ACCOUNT: "Lock account"
        }}
        secureAccountLink="https://example.com/lock"
      />
    ))

    expect(html).toContain("Unknown login")
    expect(html).toContain("Login details")
    expect(html).toContain("Firefox")
    expect(html).toContain("Lock account")
    expect(html).toContain("https://example.com/lock")
  })

  it("renders OrganizationInvitationEmail with invitation details", async () => {
    const invitationProps = {
      appName: "Better Auth UI",
      darkMode: true,
      expirationHours: 48,
      inviterEmail: "jane@example.com",
      inviterName: "Jane Doe",
      organizationName: "Acme Inc.",
      poweredBy: true,
      role: "admin",
      url: "https://example.com/settings/organizations"
    }

    const html = await render(() => (
      <OrganizationInvitationEmail {...invitationProps} />
    ))

    expect(html).toContain("You're invited to Acme Inc.")
    expect(html).toContain("Jane Doe")
    expect(html).toContain("jane@example.com")
    expect(html).toContain("Acme Inc.")
    expect(html).toContain("Better Auth UI")
    expect(html).toContain("admin")
    expect(html).toContain("Accept invitation")
    expect(html).toContain("https://example.com/settings/organizations")
    expect(html).toContain("This invitation expires in 48 hours")
  })

  it("applies OrganizationInvitationEmail localization overrides", async () => {
    const html = await render(() => (
      <OrganizationInvitationEmail
        localization={{
          YOU_RE_INVITED: "Join the workspace",
          ACCEPT_INVITATION: "Join now",
          OR_COPY_AND_PASTE_URL: "Manual invite link:"
        }}
        url="https://example.com/invite"
      />
    ))

    expect(html).toContain("Join the workspace")
    expect(html).toContain("Join now")
    expect(html).toContain("Manual invite link:")
    expect(html).toContain("https://example.com/invite")
  })
})
