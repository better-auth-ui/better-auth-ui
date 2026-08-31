import type { ComponentDefinition } from "./types.ts"

export const componentDefinitions: Record<string, ComponentDefinition> = {
  "account-settings": {
    props: "auth/settings/account/account-settings.tsx#AccountSettingsProps",
    demo: "settings/account/account-settings.tsx",
    story: {
      id: "zaidan-components-settings--account-settings-preview",
      title: "Zaidan AccountSettings preview",
      height: 560
    }
  },
  "active-sessions": {
    props: "auth/settings/security/active-sessions.tsx#ActiveSessionsProps",
    demo: "settings/security/active-sessions.tsx",
    shadcn: { registry: false },
    story: {
      id: "zaidan-components-settings--active-sessions-preview",
      title: "Zaidan ActiveSessions preview",
      height: 440
    },
    zaidan: {
      props:
        "examples/start-solid-zaidan-example/src/components/auth/settings/security/active-sessions.tsx#ActiveSessionsSettingsProps"
    }
  },
  auth: {
    props: "auth/auth.tsx#AuthProps",
    demo: "auth/auth.tsx",
    story: {
      id: "zaidan-components-auth--auth-preview",
      title: "Zaidan Auth preview",
      height: 520
    }
  },
  "auth-provider": {
    props: "auth/auth-provider.tsx#AuthProviderProps",
    preview: false,
    heroui: {
      demo: "<rootDir>/../../examples/start-heroui-example/src/components/providers.tsx"
    },
    shadcn: {
      props:
        "packages/react/src/components/auth/auth-provider.tsx#AuthProviderProps",
      demo: "<rootDir>/../../examples/start-shadcn-example/src/components/providers.tsx"
    },
    zaidan: {
      props: "packages/solid/src/lib/auth-provider.tsx#AuthProviderProps",
      demo: "<rootDir>/../../examples/start-solid-zaidan-example/src/components/providers.tsx"
    },
    registry: false
  },
  "auth-redirect": {
    props: "auth/auth-redirect.tsx#AuthRedirectProps",
    usage: false
  },
  "change-email": {
    props: "auth/settings/account/change-email.tsx#ChangeEmailProps",
    demo: "settings/account/change-email.tsx",
    story: {
      id: "zaidan-components-settings--change-email-preview",
      title: "Zaidan ChangeEmail preview",
      height: 360
    }
  },
  "change-password": {
    props: "auth/settings/security/change-password.tsx#ChangePasswordProps",
    demo: "settings/security/change-password.tsx",
    story: {
      id: "zaidan-components-settings--change-password-preview",
      title: "Zaidan ChangePassword preview",
      height: 540
    },
    zaidan: {
      props:
        "examples/start-solid-zaidan-example/src/components/auth/settings/security/change-password.tsx#ChangePasswordSettingsProps"
    }
  },
  "email/change-email-confirmation-email": {
    kind: "email",
    props:
      "auth/email/change-email-confirmation.tsx#ChangeEmailConfirmationEmailProps",
    demo: "email/change-email-confirmation-email.tsx#L13-"
  },
  "email/delete-account-verification-email": {
    kind: "email",
    props:
      "auth/email/delete-account-verification.tsx#DeleteAccountVerificationEmailProps",
    demo: "email/delete-account-verification-email.tsx#L13-"
  },
  "email/email-changed-email": {
    kind: "email",
    props: "auth/email/email-changed.tsx#EmailChangedEmailProps",
    demo: "email/email-changed-email.tsx#L13-"
  },
  "email/email-verification-email": {
    kind: "email",
    props: "auth/email/email-verification.tsx#EmailVerificationEmailProps",
    demo: "email/email-verification-email.tsx#L13-"
  },
  "email/magic-link-email": {
    kind: "email",
    props: "auth/email/magic-link.tsx#MagicLinkEmailProps",
    demo: "email/magic-link-email.tsx#L13-"
  },
  "email/new-device-email": {
    kind: "email",
    props: "auth/email/new-device.tsx#NewDeviceEmailProps",
    demo: "email/new-device-email.tsx#L13-"
  },
  "email/organization-invitation-email": {
    kind: "email",
    props:
      "auth/email/organization-invitation.tsx#OrganizationInvitationEmailProps",
    demo: "email/organization-invitation-email.tsx#L13-"
  },
  "email/otp-email": {
    kind: "email",
    props: "auth/email/otp-email.tsx#OtpEmailProps",
    demo: "email/otp-email.tsx#L13-"
  },
  "email/password-changed-email": {
    kind: "email",
    props: "auth/email/password-changed.tsx#PasswordChangedEmailProps",
    demo: "email/password-changed-email.tsx#L13-"
  },
  "email/reset-password-email": {
    kind: "email",
    props: "auth/email/reset-password.tsx#ResetPasswordEmailProps",
    demo: "email/reset-password-email.tsx#L13-"
  },
  "forgot-password": {
    props: "auth/forgot-password.tsx#ForgotPasswordProps",
    demo: "auth/forgot-password.tsx",
    story: {
      id: "zaidan-components-auth--forgot-password-preview",
      title: "Zaidan ForgotPassword preview",
      height: 430
    }
  },
  "linked-accounts": {
    props: "auth/settings/security/linked-accounts.tsx#LinkedAccountsProps",
    demo: "settings/security/linked-accounts.tsx",
    story: {
      id: "zaidan-components-settings--linked-accounts-preview",
      title: "Zaidan LinkedAccounts preview",
      height: 440
    },
    zaidan: {
      props:
        "examples/start-solid-zaidan-example/src/components/auth/settings/security/linked-accounts.tsx#LinkedAccountsSettingsProps"
    }
  },
  "reset-link-sent": {
    props: "auth/reset-link-sent.tsx#ResetLinkSentProps",
    preview: false,
    heroui: {
      demo: {
        code: `import { ResetLinkSent } from "@better-auth-ui/heroui"

<ResetLinkSent />`
      }
    },
    installation: "before-usage",
    shadcn: {
      demo: {
        code: `import { ResetLinkSent } from "@/components/auth/reset-link-sent"

<ResetLinkSent />`
      },
      registry: "forgot-password"
    },
    zaidan: {
      demo: {
        code: `import { ResetLinkSent } from "@/components/auth/reset-link-sent"

<ResetLinkSent />`
      },
      registry: "forgot-password"
    }
  },
  "reset-password": {
    props: "auth/reset-password.tsx#ResetPasswordProps",
    demo: "auth/reset-password.tsx",
    story: {
      id: "zaidan-components-auth--reset-password-preview",
      title: "Zaidan ResetPassword preview",
      height: 520
    }
  },
  "security-settings": {
    props: "auth/settings/security/security-settings.tsx#SecuritySettingsProps",
    demo: "settings/security/security-settings.tsx",
    story: {
      id: "zaidan-components-settings--security-settings-preview",
      title: "Zaidan SecuritySettings preview",
      height: 920
    }
  },
  settings: {
    props: "auth/settings/settings.tsx#SettingsProps",
    demo: "settings/settings.tsx",
    story: {
      id: "zaidan-components-settings--settings-preview",
      title: "Zaidan Settings preview",
      height: 760
    }
  },
  "sign-in": {
    props: "auth/sign-in.tsx#SignInProps",
    demo: "auth/sign-in.tsx",
    story: {
      id: "zaidan-components-auth--sign-in-preview",
      title: "Zaidan SignIn preview",
      height: 520
    }
  },
  "sign-out": {
    props: "auth/sign-out.tsx#SignOutProps",
    demo: "auth/sign-out.tsx",
    story: {
      id: "zaidan-components-auth--sign-out-preview",
      title: "Zaidan SignOut preview",
      height: 260
    }
  },
  "sign-up": {
    props: "auth/sign-up.tsx#SignUpProps",
    demo: "auth/sign-up.tsx",
    story: {
      id: "zaidan-components-auth--sign-up-preview",
      title: "Zaidan SignUp preview",
      height: 620
    }
  },
  "user-avatar": {
    props: "auth/user/user-avatar.tsx#UserAvatarProps",
    demo: "user/user-avatar.tsx",
    story: {
      id: "zaidan-components-user--user-avatar-preview",
      title: "Zaidan UserAvatar preview",
      height: 260
    }
  },
  "user-button": {
    props: "auth/user/user-button.tsx#UserButtonProps",
    demo: "user/user-button.tsx",
    story: {
      id: "zaidan-components-user--user-button-preview",
      title: "Zaidan UserButton preview",
      height: 260
    }
  },
  "user-profile": {
    props: "auth/settings/account/user-profile.tsx#UserProfileProps",
    demo: "settings/account/user-profile.tsx",
    story: {
      id: "zaidan-components-settings--user-profile-preview",
      title: "Zaidan UserProfile preview",
      height: 440
    }
  },
  "user-view": {
    props: "auth/user/user-view.tsx#UserViewProps",
    demo: "user/user-view.tsx",
    story: {
      id: "zaidan-components-user--user-view-preview",
      title: "Zaidan UserView preview",
      height: 260
    }
  },
  "verify-email": {
    props: "auth/verify-email.tsx#VerifyEmailProps",
    demo: "auth/verify-email.tsx",
    story: {
      id: "zaidan-components-auth--verify-email-preview",
      title: "Zaidan VerifyEmail preview",
      height: 430
    }
  }
}
