import { describe, expect, it } from "vitest"
import { localization } from "../src/lib/localization"

describe("localization", () => {
  describe("auth localization", () => {
    it("should have all required auth strings", () => {
      expect(localization.auth.account).toBe("Account")
      expect(localization.auth.email).toBe("Email")
      expect(localization.auth.password).toBe("Password")
      expect(localization.auth.signIn).toBe("Sign In")
      expect(localization.auth.signUp).toBe("Sign Up")
      expect(localization.auth.signOut).toBe("Sign Out")
    })

    it("should have forgot password strings", () => {
      expect(localization.auth.forgotPassword).toBe("Forgot Password")
      expect(localization.auth.forgotPasswordLink).toBe("Forgot password?")
      expect(localization.auth.passwordResetEmailSent).toBe(
        "Password reset email sent"
      )
      expect(localization.auth.passwordResetSuccess).toBe(
        "Password reset successfully"
      )
    })

    it("should have magic link strings", () => {
      expect(localization.auth.magicLink).toBe("Magic link")
      expect(localization.auth.magicLinkSent).toBe(
        "Magic link sent to your email"
      )
      expect(localization.auth.sendMagicLink).toBe("Send Magic Link")
    })

    it("should have password field strings", () => {
      expect(localization.auth.newPassword).toBe("New password")
      expect(localization.auth.confirmPassword).toBe("Confirm password")
      expect(localization.auth.hidePassword).toBe("Hide password")
      expect(localization.auth.showPassword).toBe("Show password")
      expect(localization.auth.passwordsDoNotMatch).toBe(
        "Passwords do not match"
      )
    })

    it("should have placeholder strings", () => {
      expect(localization.auth.emailPlaceholder).toBe("Enter your email")
      expect(localization.auth.passwordPlaceholder).toBe("Enter your password")
      expect(localization.auth.namePlaceholder).toBe("Enter your name")
      expect(localization.auth.newPasswordPlaceholder).toBe(
        "Enter your new password"
      )
      expect(localization.auth.confirmPasswordPlaceholder).toBe(
        "Confirm your password"
      )
    })

    it("should have navigation strings", () => {
      expect(localization.auth.alreadyHaveAnAccount).toBe(
        "Already have an account?"
      )
      expect(localization.auth.needToCreateAnAccount).toBe(
        "Need to create an account?"
      )
      expect(localization.auth.rememberYourPassword).toBe(
        "Remember your password?"
      )
    })

    it("should have action strings", () => {
      expect(localization.auth.resend).toBe("Resend")
      expect(localization.auth.resetPassword).toBe("Reset Password")
      expect(localization.auth.sendResetLink).toBe("Send Reset Link")
      expect(localization.auth.rememberMe).toBe("Remember me")
    })

    it("should have verification strings", () => {
      expect(localization.auth.verifyYourEmail).toBe("Verify your email")
      expect(localization.auth.verificationEmailSent).toBe(
        "Verification email sent!"
      )
    })

    it("should have provider string template", () => {
      expect(localization.auth.continueWith).toBe("Continue with {{provider}}")
    })

    it("should have OR string", () => {
      expect(localization.auth.or).toBe("OR")
    })

    it("should have error strings", () => {
      expect(localization.auth.invalidResetPasswordToken).toBe(
        "Invalid reset password token"
      )
    })
  })

  describe("settings localization", () => {
    it("should have all required settings strings", () => {
      expect(localization.settings.settings).toBe("Settings")
      expect(localization.settings.account).toBe("Account")
      expect(localization.settings.security).toBe("Security")
      expect(localization.settings.profile).toBe("Profile")
    })

    it("should have action strings", () => {
      expect(localization.settings.saveChanges).toBe("Save changes")
      expect(localization.settings.profileUpdatedSuccess).toBe(
        "Profile updated successfully"
      )
    })
  })

  describe("type structure", () => {
    it("should have correct nested structure", () => {
      expect(localization).toHaveProperty("auth")
      expect(localization).toHaveProperty("settings")
      expect(typeof localization.auth).toBe("object")
      expect(typeof localization.settings).toBe("object")
    })

    it("should have all strings as non-empty strings", () => {
      const checkStrings = (obj: Record<string, unknown>) => {
        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            checkStrings(value as Record<string, unknown>)
          } else {
            expect(typeof value).toBe("string")
            expect((value as string).length).toBeGreaterThan(0)
          }
        })
      }

      checkStrings(localization as unknown as Record<string, unknown>)
    })
  })
})