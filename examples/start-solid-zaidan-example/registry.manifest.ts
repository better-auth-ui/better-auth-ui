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

const componentFile = (path: SolidRegistryFile["path"]) =>
  ({ path, type: "registry:component" }) satisfies SolidRegistryFile

const libFile = (path: SolidRegistryFile["path"]) =>
  ({ path, type: "registry:lib" }) satisfies SolidRegistryFile

const uiFile = (path: SolidRegistryFile["path"]) =>
  ({ path, type: "registry:ui" }) satisfies SolidRegistryFile

const zaidanFormUiFiles = [
  uiFile("src/components/ui/button.tsx"),
  uiFile("src/components/ui/card.tsx"),
  uiFile("src/components/ui/input.tsx"),
  uiFile("src/components/ui/label.tsx"),
  libFile("src/lib/utils.ts")
] satisfies SolidRegistryFile[]

const zaidanInteractiveUiFiles = [
  uiFile("src/components/ui/avatar.tsx"),
  uiFile("src/components/ui/button.tsx"),
  uiFile("src/components/ui/card.tsx"),
  uiFile("src/components/ui/dialog.tsx"),
  uiFile("src/components/ui/dropdown-menu.tsx"),
  uiFile("src/components/ui/input.tsx"),
  uiFile("src/components/ui/item.tsx"),
  uiFile("src/components/ui/label.tsx"),
  uiFile("src/components/ui/separator.tsx"),
  uiFile("src/components/ui/skeleton.tsx"),
  uiFile("src/components/ui/tabs.tsx"),
  libFile("src/lib/utils.ts")
] satisfies SolidRegistryFile[]

const item = ({
  dependencies = solidAuthDependencies,
  files,
  registryDependencies = ["solid/auth-provider"],
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
      registryDependencies: [],
      files: [
        componentFile("src/components/auth/auth-provider.tsx"),
        componentFile("src/components/auth/error-toaster.tsx"),
        uiFile("src/components/ui/sonner.tsx"),
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
        ...zaidanFormUiFiles
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
        ...zaidanFormUiFiles
      ]
    }),
    item({
      name: "sign-up",
      type: "registry:component",
      title: "Solid Sign Up",
      description:
        "Solid sign-up component using the Solid email sign-up mutation options.",
      registryDependencies: ["solid/auth-provider", "solid/additional-field"],
      files: [
        componentFile("src/components/auth/sign-up.tsx"),
        componentFile("src/components/auth/provider-button.tsx"),
        componentFile("src/components/auth/provider-buttons.tsx"),
        ...zaidanFormUiFiles
      ]
    }),
    item({
      name: "magic-link",
      type: "registry:component",
      title: "Solid Magic Link",
      description: "Solid magic-link sign-in form and toggle button.",
      files: [
        libFile("src/lib/auth/magic-link-plugin.ts"),
        componentFile("src/components/auth/magic-link.tsx"),
        componentFile("src/components/auth/magic-link-button.tsx"),
        ...zaidanFormUiFiles
      ]
    }),
    item({
      name: "username",
      type: "registry:component",
      title: "Solid Username",
      description:
        "Solid username sign-in form and username availability field.",
      files: [
        componentFile("src/components/auth/username/sign-in-username.tsx"),
        componentFile("src/components/auth/username/username-field.tsx"),
        componentFile("src/components/auth/sign-in-path.ts"),
        ...zaidanFormUiFiles
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
        componentFile("src/components/auth/passkey/passkey-button.tsx"),
        componentFile("src/components/auth/passkey/passkeys.tsx"),
        componentFile("src/components/auth/passkey/passkey.tsx"),
        componentFile("src/components/auth/passkey/passkeys-empty.tsx"),
        componentFile("src/components/auth/passkey/passkey-skeleton.tsx"),
        componentFile("src/components/auth/passkey/add-passkey-dialog.tsx"),
        componentFile("src/components/auth/passkey/delete-passkey-dialog.tsx"),
        ...zaidanInteractiveUiFiles
      ]
    }),
    item({
      name: "api-key",
      type: "registry:component",
      title: "Solid API Keys",
      description: "Solid API key management cards and dialogs.",
      dependencies: [...solidAuthDependencies, "@better-auth/api-key"],
      files: [
        componentFile("src/components/auth/api-key/api-keys.tsx"),
        componentFile("src/components/auth/api-key/api-key.tsx"),
        componentFile("src/components/auth/api-key/api-keys-empty.tsx"),
        componentFile("src/components/auth/api-key/api-key-skeleton.tsx"),
        componentFile("src/components/auth/api-key/create-api-key-dialog.tsx"),
        componentFile("src/components/auth/api-key/delete-api-key-dialog.tsx"),
        componentFile("src/components/auth/api-key/new-api-key-dialog.tsx"),
        ...zaidanInteractiveUiFiles
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
        ...zaidanFormUiFiles
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
        ...zaidanFormUiFiles
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
      files: [componentFile("src/components/auth/auth.tsx")]
    }),
    item({
      name: "user-button",
      type: "registry:component",
      title: "Solid User Button",
      description:
        "Solid user menu trigger with account, settings, theme, and auth links.",
      registryDependencies: ["solid/auth-provider", "solid/theme"],
      files: [
        componentFile("src/components/auth/user-button.tsx"),
        componentFile("src/components/auth/user/user-button.tsx"),
        componentFile("src/components/auth/user/user-avatar.tsx"),
        componentFile("src/components/auth/user/user-view.tsx"),
        componentFile("src/components/auth/theme/theme-toggle-item.tsx"),
        libFile("src/lib/theme.ts"),
        ...zaidanInteractiveUiFiles
      ]
    }),
    item({
      name: "user-avatar",
      type: "registry:component",
      title: "Solid User Avatar",
      description: "Solid user avatar primitive for auth account surfaces.",
      files: [
        componentFile("src/components/auth/user/user-avatar.tsx"),
        uiFile("src/components/ui/avatar.tsx"),
        libFile("src/lib/utils.ts")
      ]
    }),
    item({
      name: "user-view",
      type: "registry:component",
      title: "Solid User View",
      description:
        "Solid user identity row used by account menus and profile surfaces.",
      registryDependencies: ["solid/user-avatar"],
      files: [
        componentFile("src/components/auth/user/user-view.tsx"),
        componentFile("src/components/auth/user/user-avatar.tsx"),
        uiFile("src/components/ui/avatar.tsx"),
        libFile("src/lib/utils.ts")
      ]
    }),
    item({
      name: "user-profile",
      type: "registry:component",
      title: "Solid User Profile",
      description: "Solid user profile card for account settings.",
      registryDependencies: ["solid/auth-provider", "solid/additional-field"],
      files: [
        componentFile("src/components/auth/settings/account/user-profile.tsx"),
        componentFile("src/components/auth/settings/account/change-avatar.tsx"),
        componentFile("src/components/auth/additional-field.tsx"),
        ...zaidanInteractiveUiFiles
      ]
    }),
    item({
      name: "account-settings",
      type: "registry:component",
      title: "Solid Account Settings",
      description:
        "Solid account settings with profile, email, appearance, and danger-zone cards.",
      registryDependencies: [
        "solid/user-profile",
        "solid/change-email",
        "solid/delete-user",
        "solid/theme"
      ],
      files: [
        componentFile(
          "src/components/auth/settings/account/account-settings.tsx"
        ),
        componentFile(
          "src/components/auth/settings/account/manage-account-row.tsx"
        ),
        componentFile(
          "src/components/auth/settings/account/appearance-settings.tsx"
        ),
        ...zaidanInteractiveUiFiles
      ]
    }),
    item({
      name: "security-settings",
      type: "registry:component",
      title: "Solid Security Settings",
      description:
        "Solid security settings tabs for sessions, linked accounts, passkeys, and API keys.",
      registryDependencies: [
        "solid/active-sessions",
        "solid/linked-accounts",
        "solid/change-password",
        "solid/passkey",
        "solid/api-key"
      ],
      files: [
        componentFile(
          "src/components/auth/settings/security/security-settings.tsx"
        ),
        componentFile("src/components/auth/settings/shared/helpers.ts"),
        componentFile("src/components/auth/settings/shared/types.ts"),
        ...zaidanInteractiveUiFiles
      ]
    }),
    item({
      name: "settings",
      type: "registry:component",
      title: "Solid Settings",
      description:
        "Solid settings shell combining account and security sections.",
      registryDependencies: [
        "solid/account-settings",
        "solid/security-settings"
      ],
      files: [
        componentFile("src/components/auth/settings/settings.tsx"),
        ...zaidanInteractiveUiFiles
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
        ...zaidanInteractiveUiFiles
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
        ...zaidanInteractiveUiFiles
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
        ...zaidanFormUiFiles
      ]
    }),
    item({
      name: "change-email",
      type: "registry:component",
      title: "Solid Change Email",
      description: "Solid change-email settings card.",
      files: [
        componentFile("src/components/auth/settings/account/change-email.tsx"),
        ...zaidanFormUiFiles
      ]
    }),
    item({
      name: "delete-user",
      type: "registry:component",
      title: "Solid Delete User",
      description:
        "Solid delete-user danger-zone card and confirmation dialog.",
      files: [
        componentFile("src/components/auth/delete-user/danger-zone.tsx"),
        componentFile("src/components/auth/delete-user/delete-user.tsx"),
        ...zaidanInteractiveUiFiles
      ]
    }),
    item({
      name: "multi-session",
      type: "registry:component",
      title: "Solid Multi Session",
      description: "Solid multi-session account switcher components.",
      files: [
        componentFile("src/components/auth/multi-session/manage-account.tsx"),
        componentFile("src/components/auth/multi-session/manage-accounts.tsx"),
        ...zaidanInteractiveUiFiles
      ]
    }),
    item({
      name: "theme",
      type: "registry:component",
      title: "Solid Theme",
      description:
        "Solid theme preference utilities and controls for auth surfaces.",
      registryDependencies: [],
      files: [
        componentFile("src/components/auth/theme/appearance.tsx"),
        componentFile("src/components/auth/theme/theme-toggle-item.tsx"),
        libFile("src/lib/theme.ts"),
        uiFile("src/components/ui/tabs.tsx"),
        uiFile("src/components/ui/dropdown-menu.tsx"),
        libFile("src/lib/utils.ts")
      ]
    })
  ]
} satisfies SolidRegistryManifest
