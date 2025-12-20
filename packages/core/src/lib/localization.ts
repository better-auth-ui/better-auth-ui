export const localization = {
  auth: {
    /** @remarks `"Account"` */
    account: "Account",

    /** @remarks `"Already have an account?"` */
    alreadyHaveAnAccount: "Already have an account?",

    /** @remarks `"Continue with {{provider}}"` */
    continueWith: "Continue with {{provider}}",

    /** @remarks `"Email"` */
    email: "Email",

    /** @remarks `"Enter your email"` */
    emailPlaceholder: "Enter your email",

    /** @remarks `"Forgot Password"` */
    forgotPassword: "Forgot Password",

    /** @remarks `"Forgot password?"` */
    forgotPasswordLink: "Forgot password?",

    /** @remarks `"Hide password"` */
    hidePassword: "Hide password",

    /** @remarks `"Invalid reset password token"` */
    invalidResetPasswordToken: "Invalid reset password token",

    /** @remarks `"Magic link"` */
    magicLink: "Magic link",

    /** @remarks `"Magic link sent to your email"` */
    magicLinkSent: "Magic link sent to your email",

    /** @remarks `"Name"` */
    name: "Name",

    /** @remarks `"Enter your name"` */
    namePlaceholder: "Enter your name",

    /** @remarks `"New password"` */
    newPassword: "New password",

    /** @remarks `"Enter your new password"` */
    newPasswordPlaceholder: "Enter your new password",

    /** @remarks `"Password"` */
    password: "Password",

    /** @remarks `"Enter your password"` */
    passwordPlaceholder: "Enter your password",

    /** @remarks `"Confirm password"` */
    confirmPassword: "Confirm password",

    /** @remarks `"Confirm your password"` */
    confirmPasswordPlaceholder: "Confirm your password",

    /** @remarks `"Passwords do not match"` */
    passwordsDoNotMatch: "Passwords do not match",

    /** @remarks `"Password reset email sent"` */
    passwordResetEmailSent: "Password reset email sent",

    /** @remarks `"Password reset successfully"` */
    passwordResetSuccess: "Password reset successfully",

    /** @remarks `"Need to create an account?"` */
    needToCreateAnAccount: "Need to create an account?",

    /** @remarks `"OR"` */
    or: "OR",

    /** @remarks `"Remember your password?"` */
    rememberYourPassword: "Remember your password?",

    /** @remarks `"Remember me"` */
    rememberMe: "Remember me",

    /** @remarks `"Resend"` */
    resend: "Resend",

    /** @remarks `"Reset Password"` */
    resetPassword: "Reset Password",

    /** @remarks `"Send Magic Link"` */
    sendMagicLink: "Send Magic Link",

    /** @remarks `"Send Reset Link"` */
    sendResetLink: "Send Reset Link",

    /** @remarks `"Show password"` */
    showPassword: "Show password",

    /** @remarks `"Sign In"` */
    signIn: "Sign In",

    /** @remarks `"Sign Out"` */
    signOut: "Sign Out",

    /** @remarks `"Sign Up"` */
    signUp: "Sign Up",

    /** @remarks `"Verification email sent!"` */
    verificationEmailSent: "Verification email sent!",

    /** @remarks `"Verify your email"` */
    verifyYourEmail: "Verify your email"
  },
  account: {
    /** @remarks `"Profile"` */
    profile: "Profile",

    /** @remarks `"Profile updated successfully"` */
    profileUpdatedSuccess: "Profile updated successfully",

    /** @remarks `"Save changes"` */
    saveChanges: "Save changes",

    /** @remarks `"Security"` */
    security: "Security"
  }
}

export type Localization = typeof localization
export type AuthLocalization = Localization["auth"]
export type AccountLocalization = Localization["account"]
