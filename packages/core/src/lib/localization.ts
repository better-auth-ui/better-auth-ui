export const localization = {
  auth: {
    /** @remarks `"Account"` */
    account: "Account",

    /** @remarks `"Add Account"` */
    addAccount: "Add Account",

    /** @remarks `"Already have an account?"` */
    alreadyHaveAnAccount: "Already have an account?",

    /** @remarks `"Confirm Password"` */
    confirmPassword: "Confirm Password",

    /** @remarks `"Confirm your password"` */
    confirmPasswordPlaceholder: "Confirm your password",

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

    /** @remarks `"Magic Link"` */
    magicLink: "Magic Link",

    /** @remarks `"Magic link sent to your email"` */
    magicLinkSent: "Magic link sent to your email",

    /** @remarks `"Name"` */
    name: "Name",

    /** @remarks `"Enter your name"` */
    namePlaceholder: "Enter your name",

    /** @remarks `"Need to create an account?"` */
    needToCreateAnAccount: "Need to create an account?",

    /** @remarks `"New Password"` */
    newPassword: "New Password",

    /** @remarks `"Enter your new password"` */
    newPasswordPlaceholder: "Enter your new password",

    /** @remarks `"OR"` */
    or: "OR",

    /** @remarks `"Password"` */
    password: "Password",

    /** @remarks `"Enter your password"` */
    passwordPlaceholder: "Enter your password",

    /** @remarks `"Password reset email sent"` */
    passwordResetEmailSent: "Password reset email sent",

    /** @remarks `"Password reset successfully"` */
    passwordResetSuccess: "Password reset successfully",

    /** @remarks `"Passwords do not match"` */
    passwordsDoNotMatch: "Passwords do not match",

    /** @remarks `"Remember me"` */
    rememberMe: "Remember me",

    /** @remarks `"Remember your password?"` */
    rememberYourPassword: "Remember your password?",

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

    /** @remarks `"Switch Account"` */
    switchAccount: "Switch Account",

    /** @remarks `"Verification email sent!"` */
    verificationEmailSent: "Verification email sent!",

    /** @remarks `"Verify your email"` */
    verifyYourEmail: "Verify your email"
  },
  settings: {
    /** @remarks `"Account"` */
    account: "Account",

    /** @remarks `"Accounts"` */
    accounts: "Accounts",

    /** @remarks `"Accounts description"` */
    accountsDescription:
      "Manage the accounts you're currently signed in to on this device.",

    /** @remarks `"Account unlinked"` */
    accountUnlinked: "Account unlinked",

    /** @remarks `"Active"` */
    active: "Active",

    /** @remarks `"Connected Accounts"` */
    connectedAccounts: "Connected Accounts",

    /** @remarks `"Current Session"` */
    currentSession: "Current Session",

    /** @remarks `"Connect {{provider}}"` */
    connectProvider: "Connect {{provider}}",

    /** @remarks `"Appearance"` */
    appearance: "Appearance",

    /** @remarks `"Change Email"` */
    changeEmail: "Change Email",

    /** @remarks `"Check your email to confirm the change"` */
    changeEmailSuccess: "Check your email to confirm the change",

    /** @remarks `"Change Password"` */
    changePassword: "Change Password",

    /** @remarks `"Password changed successfully"` */
    changePasswordSuccess: "Password changed successfully",

    /** @remarks `"Current Password"` */
    currentPassword: "Current Password",

    /** @remarks `"Enter your current password"` */
    currentPasswordPlaceholder: "Enter your current password",

    /** @remarks `"Dark"` */
    dark: "Dark",

    /** @remarks `"Light"` */
    light: "Light",

    /** @remarks `"Profile"` */
    profile: "Profile",

    /** @remarks `"Profile updated successfully"` */
    profileUpdatedSuccess: "Profile updated successfully",

    /** @remarks `"Revoke Session"` */
    revokeSession: "Revoke Session",

    /** @remarks `"Session revoked successfully"` */
    revokeSessionSuccess: "Session revoked successfully",

    /** @remarks `"Save changes"` */
    saveChanges: "Save changes",

    /** @remarks `"Security"` */
    security: "Security",

    /** @remarks `"Sessions"` */
    sessions: "Sessions",

    /** @remarks `"Settings"` */
    settings: "Settings",

    /** @remarks `"System"` */
    system: "System",

    /** @remarks `"Theme"` */
    theme: "Theme",

    /** @remarks `"Unlink {{provider}}"` */
    unlinkProvider: "Unlink {{provider}}",

    /** @remarks `"Update Email"` */
    updateEmail: "Update Email",

    /** @remarks `"Update Password"` */
    updatePassword: "Update Password"
  }
}

export type Localization = typeof localization
export type AuthLocalization = Localization["auth"]
export type SettingsLocalization = Localization["settings"]
