import { describe, expect, it } from "vitest"
import { localization, type Localization } from "../src/lib/localization"

describe("localization", () => {
  describe("auth localization", () => {
    it("should have all auth keys defined", () => {
      expect(localization.auth).toBeDefined()
      expect(typeof localization.auth).toBe("object")
    })

    it("should have basic auth labels", () => {
      expect(localization.auth.account).toBe("Account")
      expect(localization.auth.email).toBe("Email")
      expect(localization.auth.password).toBe("Password")
      expect(localization.auth.name).toBe("Name")
    })

    it("should have placeholder texts", () => {
      expect(localization.auth.emailPlaceholder).toBe("Enter your email")
      expect(localization.auth.passwordPlaceholder).toBe("Enter your password")
      expect(localization.auth.namePlaceholder).toBe("Enter your name")
      expect(localization.auth.newPasswordPlaceholder).toBe("Enter your new password")
      expect(localization.auth.confirmPasswordPlaceholder).toBe("Confirm your password")
    })

    it("should have sign in/up related texts", () => {
      expect(localization.auth.signIn).toBe("Sign in")
      expect(localization.auth.signUp).toBe("Sign up")
      expect(localization.auth.signOut).toBe("Sign out")
      expect(localization.auth.signingIn).toBe("Signing in...")
      expect(localization.auth.signingUp).toBe("Signing up...")
      expect(localization.auth.signingOut).toBe("Signing out...")
    })

    it("should have password recovery texts", () => {
      expect(localization.auth.forgotPassword).toBe("Forgot Password")
      expect(localization.auth.forgotPasswordLink).toBe("Forgot password?")
      expect(localization.auth.resetPassword).toBe("Reset password")
      expect(localization.auth.newPassword).toBe("New password")
      expect(localization.auth.passwordResetEmailSent).toBe("Password reset email sent")
      expect(localization.auth.passwordResetSuccess).toBe("Password reset successfully")
    })

    it("should have magic link texts", () => {
      expect(localization.auth.magicLink).toBe("Magic link")
      expect(localization.auth.magicLinkSent).toBe("Magic link sent to your email")
      expect(localization.auth.sendMagicLink).toBe("Send magic link")
      expect(localization.auth.sendingMagicLink).toBe("Sending magic link...")
    })

    it("should have social provider text", () => {
      expect(localization.auth.continueWith).toBe("Continue with {{provider}}")
    })

    it("should have question prompts", () => {
      expect(localization.auth.alreadyHaveAnAccount).toBe("Already have an account?")
      expect(localization.auth.needToCreateAnAccount).toBe("Need to create an account?")
      expect(localization.auth.rememberYourPassword).toBe("Remember your password?")
    })

    it("should have separator text", () => {
      expect(localization.auth.or).toBe("OR")
    })

    it("should have password visibility texts", () => {
      expect(localization.auth.showPassword).toBe("Show password")
      expect(localization.auth.hidePassword).toBe("Hide password")
    })

    it("should have remember me text", () => {
      expect(localization.auth.rememberMe).toBe("Remember me")
    })

    it("should have password confirmation texts", () => {
      expect(localization.auth.confirmPassword).toBe("Confirm password")
      expect(localization.auth.passwordsDoNotMatch).toBe("Passwords do not match")
    })

    it("should have error messages", () => {
      expect(localization.auth.invalidResetPasswordToken).toBe("Invalid reset password token")
    })

    it("should have verification texts", () => {
      expect(localization.auth.resend).toBe("Resend")
      expect(localization.auth.verificationEmailSent).toBe("Verification email sent")
    })
  })

  describe("settings localization", () => {
    it("should have all settings keys defined", () => {
      expect(localization.settings).toBeDefined()
      expect(typeof localization.settings).toBe("object")
    })

    it("should have tab navigation labels", () => {
      expect(localization.settings.account).toBe("Account")
      expect(localization.settings.security).toBe("Security")
    })

    it("should have update action texts", () => {
      expect(localization.settings.update).toBe("Update")
      expect(localization.settings.updating).toBe("Updating...")
      expect(localization.settings.updated).toBe("Updated")
    })

    it("should have profile-related texts", () => {
      expect(localization.settings.editProfile).toBe("Edit profile")
      expect(localization.settings.updateProfile).toBe("Update profile")
      expect(localization.settings.avatar).toBe("Avatar")
    })
  })

  describe("email localization", () => {
    it("should have all email keys defined", () => {
      expect(localization.email).toBeDefined()
      expect(typeof localization.email).toBe("object")
    })

    it("should have common email labels", () => {
      expect(localization.email.yourEmail).toBe("Your email")
      expect(localization.email.ifYouDidNotRequest).toContain("If you did not request")
      expect(localization.email.contactSupport).toBe("contact support")
    })

    it("should have verification email texts", () => {
      expect(localization.email.verifyYourEmail).toBe("Verify your email")
      expect(localization.email.clickButtonToVerify).toContain("Click the button below")
      expect(localization.email.verifyEmail).toBe("Verify Email")
      expect(localization.email.linkExpiresIn).toBe("This link expires in {{minutes}} minutes")
    })

    it("should have magic link email texts", () => {
      expect(localization.email.signInToYourAccount).toBe("Sign in to your account")
      expect(localization.email.clickButtonToSignIn).toContain("Click the button below")
      expect(localization.email.signIn).toBe("Sign in")
    })

    it("should have password reset email texts", () => {
      expect(localization.email.resetYourPassword).toBe("Reset your password")
      expect(localization.email.clickButtonToReset).toContain("Click the button below")
      expect(localization.email.resetPassword).toBe("Reset Password")
    })

    it("should have OTP email texts", () => {
      expect(localization.email.yourVerificationCode).toBe("Your verification code")
      expect(localization.email.enterCodeToVerify).toContain("Enter this code")
      expect(localization.email.verificationCode).toBe("Verification Code")
      expect(localization.email.codeExpiresIn).toBe("This code expires in {{minutes}} minutes")
    })

    it("should have password changed email texts", () => {
      expect(localization.email.passwordChanged).toBe("Password changed")
      expect(localization.email.passwordChangedSuccessfully).toContain("Your password has been changed")
      expect(localization.email.ifYouDidNotChange).toContain("If you did not change")
      expect(localization.email.secureYourAccount).toBe("Secure your account")
    })

    it("should have email changed notification texts", () => {
      expect(localization.email.emailChanged).toBe("Email changed")
      expect(localization.email.yourEmailHasBeenChanged).toContain("Your email has been changed")
      expect(localization.email.previousEmail).toBe("Previous email")
      expect(localization.email.newEmail).toBe("New email")
      expect(localization.email.revertEmailChange).toBe("Revert email change")
    })

    it("should have new device email texts", () => {
      expect(localization.email.newDeviceSignIn).toBe("New device sign-in")
      expect(localization.email.detectedSignInFromNewDevice).toContain("We detected a sign-in")
      expect(localization.email.deviceDetails).toBe("Device details")
      expect(localization.email.browser).toBe("Browser")
      expect(localization.email.operatingSystem).toBe("Operating System")
      expect(localization.email.location).toBe("Location")
      expect(localization.email.ipAddress).toBe("IP Address")
      expect(localization.email.time).toBe("Time")
    })

    it("should have fallback text for manual URL copying", () => {
      expect(localization.email.orCopyLink).toBe("Or copy and paste this URL")
    })
  })

  describe("type safety", () => {
    it("should match Localization type structure", () => {
      const customLocalization: Localization = {
        auth: {
          ...localization.auth,
          signIn: "Custom Sign In"
        },
        settings: {
          ...localization.settings
        },
        email: {
          ...localization.email
        }
      }

      expect(customLocalization.auth.signIn).toBe("Custom Sign In")
    })

    it("should allow partial overrides while maintaining type safety", () => {
      const partialOverride: Partial<Localization> = {
        auth: {
          ...localization.auth,
          signIn: "Login",
          signUp: "Register"
        }
      }

      expect(partialOverride.auth?.signIn).toBe("Login")
      expect(partialOverride.auth?.signUp).toBe("Register")
    })
  })

  describe("template strings", () => {
    it("should have template placeholders for dynamic values", () => {
      expect(localization.auth.continueWith).toContain("{{provider}}")
      expect(localization.email.linkExpiresIn).toContain("{{minutes}}")
      expect(localization.email.codeExpiresIn).toContain("{{minutes}}")
    })
  })

  describe("consistency", () => {
    it("should have consistent action/loading/complete verb patterns", () => {
      // Sign in pattern
      expect(localization.auth.signIn).toBeDefined()
      expect(localization.auth.signingIn).toBeDefined()

      // Sign up pattern
      expect(localization.auth.signUp).toBeDefined()
      expect(localization.auth.signingUp).toBeDefined()

      // Sign out pattern
      expect(localization.auth.signOut).toBeDefined()
      expect(localization.auth.signingOut).toBeDefined()

      // Update pattern
      expect(localization.settings.update).toBeDefined()
      expect(localization.settings.updating).toBeDefined()
      expect(localization.settings.updated).toBeDefined()
    })

    it("should have consistent field/placeholder pairs", () => {
      // Email
      expect(localization.auth.email).toBeDefined()
      expect(localization.auth.emailPlaceholder).toBeDefined()

      // Password
      expect(localization.auth.password).toBeDefined()
      expect(localization.auth.passwordPlaceholder).toBeDefined()

      // Name
      expect(localization.auth.name).toBeDefined()
      expect(localization.auth.namePlaceholder).toBeDefined()

      // New password
      expect(localization.auth.newPassword).toBeDefined()
      expect(localization.auth.newPasswordPlaceholder).toBeDefined()

      // Confirm password
      expect(localization.auth.confirmPassword).toBeDefined()
      expect(localization.auth.confirmPasswordPlaceholder).toBeDefined()
    })
  })

  describe("email notifications coverage", () => {
    it("should cover all email notification types", () => {
      // Verification
      expect(localization.email.verifyYourEmail).toBeDefined()
      
      // Magic link
      expect(localization.email.signInToYourAccount).toBeDefined()
      
      // Password reset
      expect(localization.email.resetYourPassword).toBeDefined()
      
      // OTP
      expect(localization.email.yourVerificationCode).toBeDefined()
      
      // Password changed
      expect(localization.email.passwordChanged).toBeDefined()
      
      // Email changed
      expect(localization.email.emailChanged).toBeDefined()
      
      // New device
      expect(localization.email.newDeviceSignIn).toBeDefined()
    })
  })
})