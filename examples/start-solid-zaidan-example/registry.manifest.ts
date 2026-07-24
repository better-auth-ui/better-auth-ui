export type SolidRegistryFile = {
  path: `src/${string}`
  type: "registry:component" | "registry:lib" | "registry:file" | "registry:ui"
}

export type SolidRegistryItem = {
  name: string
  type: "registry:component" | "registry:lib"
  title: string
  description: string
  dependencies: string[]
  registryDependencies: string[]
  files: SolidRegistryFile[]
}

export type SolidRegistryManifest = {
  name: string
  namespace: "solid"
  homepage: string
  items: SolidRegistryItem[]
}

const solidDependencies = [
  "@better-auth-ui/solid@latest",
  "@better-auth-ui/core@latest",
  "@tanstack/solid-query",
  "@tanstack/solid-router",
  "better-auth",
  "lucide-solid",
  "solid-sonner",
  "solid-js"
]

const zaidanUiDependencies = [
  "@kobalte/core",
  "class-variance-authority",
  "clsx",
  "tailwind-merge"
]

const solidAuthDependencies = [...solidDependencies, ...zaidanUiDependencies]

const betterAuthSolidRegistryDependency = (name: string) =>
  `https://better-auth-ui.com/r/solid/${name}.json`

const zaidanStyleSetupRegistryDependencies = [
  "@zaidan/font-inter",
  "@zaidan/neutral",
  "@zaidan/style-mira"
]

const zaidanThemeUiRegistryDependencies = [
  ...zaidanStyleSetupRegistryDependencies,
  "@zaidan/card",
  "@zaidan/dropdown-menu",
  "@zaidan/tabs"
]

const zaidanUiRegistryDependencies = [
  "@zaidan/avatar",
  "@zaidan/badge",
  "@zaidan/button",
  "@zaidan/card",
  "@zaidan/dialog",
  "@zaidan/dropdown-menu",
  "@zaidan/input-group",
  "@zaidan/input",
  "@zaidan/item",
  "@zaidan/label",
  "@zaidan/separator",
  "@zaidan/skeleton",
  "@zaidan/sonner",
  "@zaidan/spinner",
  "@zaidan/table",
  "@zaidan/tabs",
  "@zaidan/textarea"
]

const solidEmailDependencies = [
  "@better-auth-ui/solid@latest",
  "@better-auth-ui/core@latest",
  "@solidjs-email/main",
  "solid-js"
]

const componentFile = (path: SolidRegistryFile["path"]) =>
  ({ path, type: "registry:component" }) satisfies SolidRegistryFile

const libFile = (path: SolidRegistryFile["path"]) =>
  ({ path, type: "registry:lib" }) satisfies SolidRegistryFile

const zaidanFormSupportFiles = [
  libFile("src/lib/utils.ts")
] satisfies SolidRegistryFile[]

const zaidanInteractiveSupportFiles = [
  libFile("src/lib/utils.ts")
] satisfies SolidRegistryFile[]

const emailFiles = (path: SolidRegistryFile["path"]) => [
  componentFile(path),
  componentFile("src/components/auth/email/email-styles.tsx")
]

const item = ({
  dependencies = solidAuthDependencies,
  files,
  registryDependencies = [betterAuthSolidRegistryDependency("auth-provider")],
  ...definition
}: Omit<SolidRegistryItem, "dependencies" | "registryDependencies"> & {
  dependencies?: string[]
  registryDependencies?: string[]
}) =>
  ({
    ...definition,
    dependencies,
    registryDependencies,
    files
  }) satisfies SolidRegistryItem

export const solidRegistryManifest = {
  name: "better-auth-ui-solid",
  namespace: "solid",
  homepage: "https://better-auth-ui.com",
  items: [
    item({
      name: "auth-provider",
      type: "registry:component",
      title: "Solid Auth Provider",
      description:
        "Solid provider wrapper for Better Auth UI using Solid Query and the Solid package surface.",
      registryDependencies: [
        ...zaidanStyleSetupRegistryDependencies,
        ...zaidanUiRegistryDependencies
      ],
      files: [
        componentFile("src/components/auth/auth-provider.tsx"),
        componentFile("src/components/auth/error-toaster.tsx"),
        libFile("src/lib/theme.ts")
      ]
    }),
    item({
      name: "additional-field",
      type: "registry:component",
      title: "Solid Additional Field",
      description:
        "Additional field renderer used by Solid sign-up and profile surfaces.",
      files: [
        componentFile("src/components/auth/additional-field.tsx"),
        ...zaidanFormSupportFiles
      ]
    }),
    item({
      name: "sign-in",
      type: "registry:component",
      title: "Solid Sign In",
      description:
        "Solid sign-in surface with email/password, username, and provider button support.",
      files: [
        componentFile("src/components/auth/sign-in.tsx"),
        componentFile("src/components/auth/username/sign-in-username.tsx"),
        componentFile("src/components/auth/sign-in-path.ts"),
        componentFile("src/components/auth/provider-button.tsx"),
        componentFile("src/components/auth/provider-buttons.tsx"),
        ...zaidanFormSupportFiles
      ]
    }),
    item({
      name: "sign-up",
      type: "registry:component",
      title: "Solid Sign Up",
      description:
        "Solid sign-up component using the Solid email sign-up mutation options.",
      registryDependencies: [
        betterAuthSolidRegistryDependency("auth-provider"),
        betterAuthSolidRegistryDependency("additional-field")
      ],
      files: [
        componentFile("src/components/auth/sign-up.tsx"),
        componentFile("src/components/auth/provider-button.tsx"),
        componentFile("src/components/auth/provider-buttons.tsx"),
        ...zaidanFormSupportFiles
      ]
    }),
    item({
      name: "magic-link",
      type: "registry:component",
      title: "Solid Magic Link",
      description:
        "Solid/Zaidan passwordless magic-link sign-in view, toggle button, and UI plugin factory.",
      files: [
        libFile("src/lib/auth/magic-link-plugin.ts"),
        componentFile("src/components/auth/magic-link.tsx"),
        componentFile("src/components/auth/magic-link-button.tsx"),
        componentFile("src/components/auth/provider-buttons.tsx"),
        componentFile("src/components/auth/provider-button.tsx"),
        componentFile("src/components/auth/sign-in-path.ts"),
        ...zaidanFormSupportFiles
      ]
    }),
    item({
      name: "username",
      type: "registry:component",
      title: "Solid Username",
      description:
        "Solid username UI plugin, sign-in form, and username availability field.",
      files: [
        libFile("src/lib/auth/username-plugin.ts"),
        componentFile("src/components/auth/username/sign-in-username.tsx"),
        componentFile("src/components/auth/username/username-field.tsx"),
        componentFile("src/components/auth/sign-in-path.ts"),
        ...zaidanFormSupportFiles
      ]
    }),
    item({
      name: "passkey",
      type: "registry:component",
      title: "Solid Passkey",
      description: "Solid passkey sign-in button and passkey management cards.",
      dependencies: [...solidAuthDependencies, "@better-auth/passkey"],
      files: [
        libFile("src/lib/auth/passkey-plugin.ts"),
        componentFile("src/components/auth/passkey/passkey-localization.ts"),
        componentFile("src/components/auth/passkey/passkey-button.tsx"),
        componentFile("src/components/auth/passkey/passkeys.tsx"),
        componentFile("src/components/auth/passkey/passkey.tsx"),
        componentFile("src/components/auth/passkey/passkeys-empty.tsx"),
        componentFile("src/components/auth/passkey/passkey-skeleton.tsx"),
        componentFile("src/components/auth/passkey/add-passkey-dialog.tsx"),
        componentFile("src/components/auth/passkey/delete-passkey-dialog.tsx"),
        ...zaidanInteractiveSupportFiles
      ]
    }),
    item({
      name: "api-key",
      type: "registry:component",
      title: "Solid API Keys",
      description: "Solid API key management cards and dialogs.",
      dependencies: [...solidAuthDependencies, "@better-auth/api-key"],
      files: [
        libFile("src/lib/auth/api-key-plugin.ts"),
        componentFile("src/components/auth/api-key/api-keys.tsx"),
        componentFile("src/components/auth/api-key/api-key.tsx"),
        componentFile("src/components/auth/api-key/api-keys-empty.tsx"),
        componentFile("src/components/auth/api-key/organization-api-keys.tsx"),
        componentFile("src/components/auth/api-key/api-key-skeleton.tsx"),
        componentFile("src/components/auth/api-key/create-api-key-dialog.tsx"),
        componentFile("src/components/auth/api-key/delete-api-key-dialog.tsx"),
        componentFile("src/components/auth/api-key/new-api-key-dialog.tsx"),
        ...zaidanInteractiveSupportFiles
      ]
    }),
    item({
      name: "forgot-password",
      type: "registry:component",
      title: "Solid Forgot Password",
      description:
        "Solid forgot-password component using the Solid password reset mutation options.",
      files: [
        componentFile("src/components/auth/forgot-password.tsx"),
        ...zaidanFormSupportFiles
      ]
    }),
    item({
      name: "reset-password",
      type: "registry:component",
      title: "Solid Reset Password",
      description:
        "Solid reset-password component using the Solid password reset mutation options.",
      files: [
        componentFile("src/components/auth/reset-password.tsx"),
        ...zaidanFormSupportFiles
      ]
    }),
    item({
      name: "verify-email",
      type: "registry:component",
      title: "Solid Verify Email",
      description:
        "Solid verify-email view with a button to open the user's email provider and a cooldown-limited resend button.",
      files: [
        componentFile("src/components/auth/verify-email.tsx"),
        componentFile("src/components/auth/open-email-button.tsx"),
        ...zaidanFormSupportFiles
      ]
    }),
    item({
      name: "sign-out",
      type: "registry:component",
      title: "Solid Sign Out",
      description:
        "Solid sign-out component that ends the session and returns to sign in.",
      dependencies: solidDependencies,
      files: [componentFile("src/components/auth/sign-out.tsx")]
    }),
    item({
      name: "auth",
      type: "registry:component",
      title: "Solid Auth",
      description:
        "Solid auth router surface that selects the active auth view.",
      registryDependencies: [
        betterAuthSolidRegistryDependency("auth-provider"),
        betterAuthSolidRegistryDependency("sign-in"),
        betterAuthSolidRegistryDependency("sign-up"),
        betterAuthSolidRegistryDependency("forgot-password"),
        betterAuthSolidRegistryDependency("reset-password"),
        betterAuthSolidRegistryDependency("verify-email"),
        betterAuthSolidRegistryDependency("sign-out")
      ],
      files: [componentFile("src/components/auth/auth.tsx")]
    }),
    item({
      name: "user-button",
      type: "registry:component",
      title: "Solid User Button",
      description:
        "Solid user menu trigger with account, settings, plugin, and auth links.",
      registryDependencies: [betterAuthSolidRegistryDependency("user-view")],
      files: [
        componentFile("src/components/auth/user-button.tsx"),
        componentFile("src/components/auth/user/user-button.tsx"),
        componentFile("src/components/auth/user/user-avatar.tsx"),
        componentFile("src/components/auth/user/user-view.tsx"),
        ...zaidanInteractiveSupportFiles
      ]
    }),
    item({
      name: "user-avatar",
      type: "registry:component",
      title: "Solid User Avatar",
      description: "Solid user avatar primitive for auth account surfaces.",
      files: [
        componentFile("src/components/auth/user/user-avatar.tsx"),
        libFile("src/lib/utils.ts")
      ]
    }),
    item({
      name: "user-view",
      type: "registry:component",
      title: "Solid User View",
      description:
        "Solid user identity row used by account menus and profile surfaces.",
      registryDependencies: [betterAuthSolidRegistryDependency("user-avatar")],
      files: [
        componentFile("src/components/auth/user/user-view.tsx"),
        componentFile("src/components/auth/user/user-avatar.tsx"),
        libFile("src/lib/utils.ts")
      ]
    }),
    item({
      name: "user-profile",
      type: "registry:component",
      title: "Solid User Profile",
      description: "Solid user profile card for account settings.",
      registryDependencies: [
        betterAuthSolidRegistryDependency("auth-provider"),
        betterAuthSolidRegistryDependency("additional-field")
      ],
      files: [
        componentFile("src/components/auth/settings/account/user-profile.tsx"),
        componentFile("src/components/auth/settings/account/change-avatar.tsx"),
        componentFile("src/components/auth/additional-field.tsx"),
        ...zaidanInteractiveSupportFiles
      ]
    }),
    item({
      name: "account-settings",
      type: "registry:component",
      title: "Solid Account Settings",
      description:
        "Solid account settings with profile, email, and plugin account cards.",
      registryDependencies: [
        betterAuthSolidRegistryDependency("user-profile"),
        betterAuthSolidRegistryDependency("change-email"),
        betterAuthSolidRegistryDependency("delete-user")
      ],
      files: [
        componentFile(
          "src/components/auth/settings/account/account-settings.tsx"
        ),
        ...zaidanInteractiveSupportFiles
      ]
    }),
    item({
      name: "security-settings",
      type: "registry:component",
      title: "Solid Security Settings",
      description:
        "Solid security settings tabs for sessions, linked accounts, passkeys, and API keys.",
      registryDependencies: [
        betterAuthSolidRegistryDependency("active-sessions"),
        betterAuthSolidRegistryDependency("linked-accounts"),
        betterAuthSolidRegistryDependency("change-password"),
        betterAuthSolidRegistryDependency("delete-user"),
        betterAuthSolidRegistryDependency("passkey"),
        betterAuthSolidRegistryDependency("api-key")
      ],
      files: [
        componentFile(
          "src/components/auth/settings/security/security-settings.tsx"
        ),
        componentFile("src/components/auth/settings/shared/helpers.ts"),
        componentFile("src/components/auth/settings/shared/types.ts"),
        ...zaidanInteractiveSupportFiles
      ]
    }),
    item({
      name: "settings",
      type: "registry:component",
      title: "Solid Settings",
      description:
        "Solid settings shell combining account and security sections.",
      registryDependencies: [
        betterAuthSolidRegistryDependency("account-settings"),
        betterAuthSolidRegistryDependency("security-settings")
      ],
      files: [
        componentFile("src/components/auth/settings/settings.tsx"),
        ...zaidanInteractiveSupportFiles
      ]
    }),
    item({
      name: "active-sessions",
      type: "registry:component",
      title: "Solid Active Sessions",
      description: "Solid active sessions management card.",
      files: [
        componentFile(
          "src/components/auth/settings/security/active-sessions.tsx"
        ),
        componentFile(
          "src/components/auth/settings/security/active-session.tsx"
        ),
        componentFile("src/components/auth/settings/shared/helpers.ts"),
        ...zaidanInteractiveSupportFiles
      ]
    }),
    item({
      name: "linked-accounts",
      type: "registry:component",
      title: "Solid Linked Accounts",
      description: "Solid linked accounts management card.",
      files: [
        componentFile(
          "src/components/auth/settings/security/linked-accounts.tsx"
        ),
        componentFile(
          "src/components/auth/settings/security/linked-account.tsx"
        ),
        componentFile("src/components/auth/settings/shared/helpers.ts"),
        componentFile("src/components/auth/settings/shared/types.ts"),
        ...zaidanInteractiveSupportFiles
      ]
    }),
    item({
      name: "change-password",
      type: "registry:component",
      title: "Solid Change Password",
      description: "Solid change-password settings card.",
      files: [
        componentFile(
          "src/components/auth/settings/security/change-password.tsx"
        ),
        componentFile("src/components/auth/settings/shared/helpers.ts"),
        componentFile("src/components/auth/settings/shared/types.ts"),
        ...zaidanFormSupportFiles
      ]
    }),
    item({
      name: "change-email",
      type: "registry:component",
      title: "Solid Change Email",
      description: "Solid change-email settings card.",
      files: [
        componentFile("src/components/auth/settings/account/change-email.tsx"),
        ...zaidanFormSupportFiles
      ]
    }),
    item({
      name: "email-verification-email",
      type: "registry:component",
      title: "Solid Email Verification Email",
      description:
        "Solid email template component that sends email verification links to users.",
      dependencies: solidEmailDependencies,
      registryDependencies: [],
      files: emailFiles("src/components/auth/email/email-verification.tsx")
    }),
    item({
      name: "magic-link-email",
      type: "registry:component",
      title: "Solid Magic Link Email",
      description:
        "Solid email template component that sends magic link authentication emails for passwordless sign-in.",
      dependencies: solidEmailDependencies,
      registryDependencies: [],
      files: emailFiles("src/components/auth/email/magic-link.tsx")
    }),
    item({
      name: "reset-password-email",
      type: "registry:component",
      title: "Solid Reset Password Email",
      description:
        "Solid email template component that sends password reset links to users.",
      dependencies: solidEmailDependencies,
      registryDependencies: [],
      files: emailFiles("src/components/auth/email/reset-password.tsx")
    }),
    item({
      name: "password-changed-email",
      type: "registry:component",
      title: "Solid Password Changed Email",
      description:
        "Solid email template component that notifies users when their password has been changed.",
      dependencies: solidEmailDependencies,
      registryDependencies: [],
      files: emailFiles("src/components/auth/email/password-changed.tsx")
    }),
    item({
      name: "email-changed-email",
      type: "registry:component",
      title: "Solid Email Changed Email",
      description:
        "Solid email template component that notifies users when their email address has been changed.",
      dependencies: solidEmailDependencies,
      registryDependencies: [],
      files: emailFiles("src/components/auth/email/email-changed.tsx")
    }),
    item({
      name: "otp-email",
      type: "registry:component",
      title: "Solid OTP Email",
      description:
        "Solid email template component that sends one-time password (OTP) verification codes to users.",
      dependencies: solidEmailDependencies,
      registryDependencies: [],
      files: emailFiles("src/components/auth/email/otp-email.tsx")
    }),
    item({
      name: "new-device-email",
      type: "registry:component",
      title: "Solid New Device Email",
      description:
        "Solid email template component that notifies users when a new device signs in to their account.",
      dependencies: solidEmailDependencies,
      registryDependencies: [],
      files: emailFiles("src/components/auth/email/new-device.tsx")
    }),
    item({
      name: "organization-invitation-email",
      type: "registry:component",
      title: "Solid Organization Invitation Email",
      description:
        "Solid email template component that invites a user to join an organization.",
      dependencies: solidEmailDependencies,
      registryDependencies: [],
      files: emailFiles("src/components/auth/email/organization-invitation.tsx")
    }),
    item({
      name: "delete-user",
      type: "registry:component",
      title: "Solid Delete User",
      description:
        "Solid delete-user danger-zone card and confirmation dialog.",
      files: [
        componentFile("src/components/auth/delete-user/danger-zone.tsx"),
        componentFile("src/components/auth/delete-user/delete-account.tsx"),
        ...zaidanInteractiveSupportFiles
      ]
    }),
    item({
      name: "multi-session",
      type: "registry:component",
      title: "Solid Multi Session",
      description: "Solid multi-session account switcher components.",
      registryDependencies: [
        betterAuthSolidRegistryDependency("auth-provider"),
        betterAuthSolidRegistryDependency("user-view")
      ],
      files: [
        libFile("src/lib/auth/multi-session-plugin.ts"),
        componentFile("src/components/auth/multi-session/manage-account.tsx"),
        componentFile("src/components/auth/multi-session/manage-accounts.tsx"),
        componentFile(
          "src/components/auth/multi-session/switch-account-submenu.tsx"
        ),
        componentFile(
          "src/components/auth/multi-session/switch-account-submenu-content.tsx"
        ),
        componentFile(
          "src/components/auth/multi-session/switch-account-submenu-item.tsx"
        ),
        componentFile("src/components/auth/settings/shared/helpers.ts"),
        componentFile("src/components/auth/settings/shared/types.ts"),
        ...zaidanInteractiveSupportFiles
      ]
    }),
    item({
      name: "organization",
      type: "registry:component",
      title: "Solid Organization",
      description:
        "Solid organization setup with settings tab, organization switcher, and slug route shell.",
      registryDependencies: [betterAuthSolidRegistryDependency("user-view")],
      files: [
        libFile("src/lib/auth/organization-plugin.tsx"),
        componentFile(
          "src/components/auth/organization/organizations-settings.tsx"
        ),
        componentFile("src/components/auth/organization/organizations.tsx"),
        componentFile("src/components/auth/organization/user-invitations.tsx"),
        componentFile(
          "src/components/auth/organization/user-invitation-row.tsx"
        ),
        componentFile(
          "src/components/auth/organization/user-invitation-row-skeleton.tsx"
        ),
        componentFile(
          "src/components/auth/organization/user-invitations-empty.tsx"
        ),
        componentFile(
          "src/components/auth/organization/create-organization-dialog.tsx"
        ),
        componentFile("src/components/auth/organization/slug-field.tsx"),
        componentFile(
          "src/components/auth/organization/organization-settings.tsx"
        ),
        componentFile(
          "src/components/auth/organization/organization-profile.tsx"
        ),
        componentFile("src/components/auth/organization/organization-logo.tsx"),
        componentFile(
          "src/components/auth/organization/change-organization-logo.tsx"
        ),
        componentFile(
          "src/components/auth/organization/organization-danger-zone.tsx"
        ),
        componentFile(
          "src/components/auth/organization/delete-organization.tsx"
        ),
        componentFile(
          "src/components/auth/organization/delete-organization-dialog.tsx"
        ),
        componentFile(
          "src/components/auth/organization/leave-organization.tsx"
        ),
        componentFile(
          "src/components/auth/organization/organization-people.tsx"
        ),
        componentFile(
          "src/components/auth/organization/organization-members.tsx"
        ),
        componentFile(
          "src/components/auth/organization/organization-member-row.tsx"
        ),
        componentFile(
          "src/components/auth/organization/organization-member-row-skeleton.tsx"
        ),
        componentFile(
          "src/components/auth/organization/organization-invitations.tsx"
        ),
        componentFile(
          "src/components/auth/organization/organization-invitation-row.tsx"
        ),
        componentFile(
          "src/components/auth/organization/organization-invitation-row-skeleton.tsx"
        ),
        componentFile(
          "src/components/auth/organization/organization-invitations-empty.tsx"
        ),
        componentFile(
          "src/components/auth/organization/invite-member-dialog.tsx"
        ),
        componentFile("src/components/auth/organization/organization-row.tsx"),
        componentFile(
          "src/components/auth/organization/organization-switcher.tsx"
        ),
        componentFile("src/components/auth/organization/organization-view.tsx"),
        componentFile(
          "src/components/auth/organization/organization-view-skeleton.tsx"
        ),
        componentFile(
          "src/components/auth/organization/organizations-empty.tsx"
        ),
        componentFile("src/components/auth/organization/organization.tsx"),
        componentFile("src/routes/organization/$slug/$path.tsx"),
        ...zaidanInteractiveSupportFiles
      ]
    }),
    item({
      name: "theme",
      type: "registry:component",
      title: "Solid Theme",
      description:
        "Solid theme preference utilities and controls for auth surfaces.",
      registryDependencies: zaidanThemeUiRegistryDependencies,
      files: [
        libFile("src/lib/auth/theme-plugin.ts"),
        componentFile("src/components/auth/theme/appearance.tsx"),
        componentFile("src/components/auth/theme/theme-toggle-item.tsx"),
        componentFile("src/components/auth/theme/theme-plugin-state.ts"),
        libFile("src/lib/theme.ts"),
        libFile("src/lib/utils.ts")
      ]
    })
  ]
} satisfies SolidRegistryManifest
