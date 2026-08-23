import { AuthProvider } from "@better-auth-ui/heroui"
import {
  AnonymousButton,
  anonymousPlugin,
  BackupCodes,
  DeviceAuthorization,
  deviceAuthorizationPlugin,
  EmailOtp,
  emailOtpPlugin,
  PhoneNumber,
  phoneNumberPlugin,
  SsoProviderSetup,
  ssoPlugin,
  TwoFactorSettings,
  twoFactorPlugin
} from "@better-auth-ui/heroui/plugins"
import type { AuthPlugin } from "@better-auth-ui/react"
import { Toast } from "@heroui/react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"

import {
  createStoryQueryClient,
  StoryShell,
  storyAuthClient,
  storySession
} from "./story-fixtures"

const device = Object.assign(
  async () => ({
    data: {
      clientId: "storybook-client",
      deviceCode: "storybook-device",
      scope: "openid profile email",
      status: "pending",
      userCode: "ABCD-EFGH"
    },
    error: null
  }),
  {
    approve: async () => ({ data: null, error: null }),
    deny: async () => ({ data: null, error: null })
  }
)

const advancedAuthClient = {
  ...(storyAuthClient as object),
  device,
  emailOtp: {
    sendVerificationOtp: async () => ({ data: null, error: null })
  },
  phoneNumber: {
    sendOtp: async () => ({ data: null, error: null }),
    verify: async () => ({ data: storySession, error: null })
  },
  signIn: {
    ...(storyAuthClient as { signIn: object }).signIn,
    anonymous: async () => ({ data: storySession, error: null }),
    emailOtp: async () => ({ data: storySession, error: null }),
    phoneNumber: async () => ({ data: storySession, error: null })
  },
  sso: {
    register: async () => ({
      data: { id: "sso_storybook", providerId: "acme" },
      error: null
    })
  },
  twoFactor: {
    disable: async () => ({ data: null, error: null }),
    enable: async () => ({ data: null, error: null }),
    generateBackupCodes: async () => ({ data: [], error: null }),
    getTotpUri: async () => ({ data: null, error: null }),
    sendOtp: async () => ({ data: null, error: null }),
    verifyBackupCode: async () => ({ data: null, error: null }),
    verifyOtp: async () => ({ data: null, error: null }),
    verifyTotp: async () => ({ data: null, error: null })
  }
} as never

function AdvancedPreview({
  children,
  plugins,
  width = "max-w-xl"
}: {
  children: ReactNode
  plugins: AuthPlugin[]
  width?: "max-w-md" | "max-w-xl" | "max-w-2xl" | "max-w-4xl"
}) {
  return (
    <AuthProvider
      authClient={advancedAuthClient}
      navigate={() => undefined}
      plugins={plugins}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      <StoryShell width={width}>{children}</StoryShell>
      <Toast.Provider />
    </AuthProvider>
  )
}

const meta = {
  title: "HeroUI/Plugins/Advanced flows",
  parameters: { layout: "fullscreen" }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const AnonymousPreview: Story = {
  name: "Anonymous sign in",
  render: () => (
    <AdvancedPreview plugins={[anonymousPlugin()]} width="max-w-md">
      <AnonymousButton />
    </AdvancedPreview>
  )
}

export const EmailOtpPreview: Story = {
  name: "Email OTP",
  render: () => (
    <AdvancedPreview plugins={[emailOtpPlugin()]} width="max-w-md">
      <EmailOtp />
    </AdvancedPreview>
  )
}

export const PhoneNumberPreview: Story = {
  name: "Phone number",
  render: () => (
    <AdvancedPreview plugins={[phoneNumberPlugin()]} width="max-w-md">
      <PhoneNumber />
    </AdvancedPreview>
  )
}

export const DeviceAuthorizationPreview: Story = {
  name: "Device authorization",
  render: () => (
    <AdvancedPreview plugins={[deviceAuthorizationPlugin()]} width="max-w-md">
      <DeviceAuthorization />
    </AdvancedPreview>
  )
}

export const SsoProviderSetupPreview: Story = {
  name: "SSO provider setup",
  render: () => (
    <AdvancedPreview plugins={[ssoPlugin()]}>
      <SsoProviderSetup defaultOrganizationId="org_acme_storybook" />
    </AdvancedPreview>
  )
}

export const TwoFactorSettingsPreview: Story = {
  name: "Two-factor settings",
  render: () => (
    <AdvancedPreview plugins={[twoFactorPlugin()]}>
      <TwoFactorSettings />
    </AdvancedPreview>
  )
}

export const BackupCodesPreview: Story = {
  name: "Backup codes",
  render: () => (
    <AdvancedPreview plugins={[twoFactorPlugin()]}>
      <BackupCodes
        codes={["4F8H-2K9M", "7Q3P-6W1N", "9C5R-8T2V", "3L7D-1X6B"]}
      />
    </AdvancedPreview>
  )
}
