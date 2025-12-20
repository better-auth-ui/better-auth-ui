import { describe, expect, it } from "vitest"
import {
  localization,
  type AuthLocalization,
  type Localization,
  type SettingsLocalization
} from "../src/lib/localization"

describe("localization", () => {
  describe("structure", () => {
    it("should have auth and settings sections", () => {
      expect(localization).toHaveProperty("auth")
      expect(localization).toHaveProperty("settings")
    })

    it("should have auth section as object", () => {
      expect(typeof localization.auth).toBe("object")
      expect(localization.auth).not.toBeNull()
    })

    it("should have settings section as object", () => {
      expect(typeof localization.settings).toBe("object")
      expect(localization.settings).not.toBeNull()
    })
  })

  describe("auth localization", () => {
    it("should contain all authentication-related strings", () => {
      const requiredKeys = [
        "account",
        "alreadyHaveAnAccount",
        "continueWith",
        "email",
        "emailPlaceholder",
        "forgotPassword",
        "forgotPasswordLink",
        "hidePassword",
        "invalidResetPasswordToken",
        "magicLink",
        "magicLinkSent",
        "name",
        "namePlaceholder",
        "newPassword",
        "newPasswordPlaceholder",
        "password",
        "passwordPlaceholder",
        "confirmPassword",
        "confirmPasswordPlaceholder",
        "passwordsDoNotMatch",
        "passwordResetEmailSent",
        "passwordResetSuccess",
        "needToCreateAnAccount",
        "or",
        "rememberYourPassword",
        "rememberMe",
        "resend",
        "resetPassword",
        "sendMagicLink",
        "sendResetLink",
        "showPassword",
        "signIn",
        "signOut",
        "signUp",
        "verificationEmailSent",
        "verifyYourEmail"
      ]

      for (const key of requiredKeys) {
        expect(localization.auth).toHaveProperty(key)
        expect(typeof localization.auth[key as keyof typeof localization.auth]).toBe("string")
        expect(localization.auth[key as keyof typeof localization.auth]).not.toBe("")
      }
    })

    it("should have correct values for common auth strings", () => {
      expect(localization.auth.signIn).toBe("Sign In")
      expect(localization.auth.signUp).toBe("Sign Up")
      expect(localization.auth.signOut).toBe("Sign Out")
      expect(localization.auth.email).toBe("Email")
      expect(localization.auth.password).toBe("Password")
      expect(localization.auth.forgotPassword).toBe("Forgot Password")
      expect(localization.auth.resetPassword).toBe("Reset Password")
    })

    it("should have placeholder strings", () => {
      expect(localization.auth.emailPlaceholder).toBe("Enter your email")
      expect(localization.auth.passwordPlaceholder).toBe("Enter your password")
      expect(localization.auth.namePlaceholder).toBe("Enter your name")
      expect(localization.auth.newPasswordPlaceholder).toBe("Enter your new password")
      expect(localization.auth.confirmPasswordPlaceholder).toBe("Confirm your password")
    })

    it("should have password visibility toggle strings", () => {
      expect(localization.auth.showPassword).toBe("Show password")
      expect(localization.auth.hidePassword).toBe("Hide password")
    })

    it("should have success and error message strings", () => {
      expect(localization.auth.magicLinkSent).toBe("Magic link sent to your email")
      expect(localization.auth.passwordResetEmailSent).toBe("Password reset email sent")
      expect(localization.auth.passwordResetSuccess).toBe("Password reset successfully")
      expect(localization.auth.verificationEmailSent).toBe("Verification email sent!")
      expect(localization.auth.passwordsDoNotMatch).toBe("Passwords do not match")
      expect(localization.auth.invalidResetPasswordToken).toBe("Invalid reset password token")
    })

    it("should have template string with placeholder for provider", () => {
      expect(localization.auth.continueWith).toContain("{{provider}}")
      expect(localization.auth.continueWith).toBe("Continue with {{provider}}")
    })

    it("should have question/link strings", () => {
      expect(localization.auth.alreadyHaveAnAccount).toBe("Already have an account?")
      expect(localization.auth.needToCreateAnAccount).toBe("Need to create an account?")
      expect(localization.auth.forgotPasswordLink).toBe("Forgot password?")
      expect(localization.auth.rememberYourPassword).toBe("Remember your password?")
    })

    it("should have action button strings", () => {
      expect(localization.auth.sendMagicLink).toBe("Send Magic Link")
      expect(localization.auth.sendResetLink).toBe("Send Reset Link")
      expect(localization.auth.resend).toBe("Resend")
      expect(localization.auth.rememberMe).toBe("Remember me")
    })

    it("should have OR separator", () => {
      expect(localization.auth.or).toBe("OR")
    })
  })

  describe("settings localization", () => {
    it("should contain all settings-related strings", () => {
      const requiredKeys = [
        "account",
        "profile",
        "profileUpdatedSuccess",
        "saveChanges",
        "security",
        "settings"
      ]

      for (const key of requiredKeys) {
        expect(localization.settings).toHaveProperty(key)
        expect(typeof localization.settings[key as keyof typeof localization.settings]).toBe(
          "string"
        )
        expect(localization.settings[key as keyof typeof localization.settings]).not.toBe("")
      }
    })

    it("should have correct values for settings strings", () => {
      expect(localization.settings.account).toBe("Account")
      expect(localization.settings.profile).toBe("Profile")
      expect(localization.settings.security).toBe("Security")
      expect(localization.settings.settings).toBe("Settings")
      expect(localization.settings.saveChanges).toBe("Save changes")
      expect(localization.settings.profileUpdatedSuccess).toBe("Profile updated successfully")
    })
  })

  describe("type exports", () => {
    it("should correctly type Localization", () => {
      const testLocalization: Localization = {
        auth: localization.auth,
        settings: localization.settings
      }

      expect(testLocalization).toEqual(localization)
    })

    it("should correctly type AuthLocalization", () => {
      const testAuthLocalization: AuthLocalization = localization.auth

      expect(testAuthLocalization.signIn).toBe("Sign In")
      expect(testAuthLocalization.signUp).toBe("Sign Up")
    })

    it("should correctly type SettingsLocalization", () => {
      const testSettingsLocalization: SettingsLocalization = localization.settings

      expect(testSettingsLocalization.settings).toBe("Settings")
      expect(testSettingsLocalization.profile).toBe("Profile")
    })
  })

  describe("immutability", () => {
    it("should not allow modification of localization object in strict mode", () => {
      const originalValue = localization.auth.signIn

      expect(() => {
        // @ts-expect-error Testing immutability
        localization.auth.signIn = "Modified"
      }).toThrow()

      expect(localization.auth.signIn).toBe(originalValue)
    })
  })
})