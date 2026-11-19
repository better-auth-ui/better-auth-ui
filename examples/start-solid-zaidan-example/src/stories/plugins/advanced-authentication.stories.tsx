import { authQueryKeys } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/solid-query"
import type { JSX } from "solid-js"
import { expect } from "storybook/test"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { AnonymousButton } from "@/components/auth/anonymous/anonymous-button"
import {
  AuthProvider,
  type AuthProviderProps
} from "@/components/auth/auth-provider"
import { DeviceAuthorization } from "@/components/auth/device-authorization/device-authorization"
import { EmailOtp } from "@/components/auth/email-otp/email-otp"
import { PhoneNumber } from "@/components/auth/phone-number/phone-number"
import { SsoProviderSetup } from "@/components/auth/sso/sso-provider-setup"
import { BackupCodes } from "@/components/auth/two-factor/backup-codes"
import { TwoFactorSettings } from "@/components/auth/two-factor/two-factor-settings"
import { anonymousPlugin } from "@/lib/auth/anonymous-plugin"
import { deviceAuthorizationPlugin } from "@/lib/auth/device-authorization-plugin"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { ssoPlugin } from "@/lib/auth/sso-plugin"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"
import { storyRenders, withStoryActions } from "../support/story-coverage"

const storyUserId = "user_advanced_storybook"

const storySession = {
  session: {
    createdAt: new Date("2026-01-12T10:30:00Z"),
    expiresAt: new Date("2026-01-12T11:30:00Z"),
    id: "session_advanced_storybook",
    token: "",
    updatedAt: new Date("2026-01-12T10:30:00Z"),
    userId: storyUserId
  },
  user: {
    email: "ada@example.com",
    emailVerified: true,
    id: storyUserId,
    image: null,
    name: "Ada Lovelace"
  }
}

const device = Object.assign(
  () =>
    Promise.resolve({
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
    approve: () => Promise.resolve({ data: null, error: null }),
    deny: () => Promise.resolve({ data: null, error: null })
  }
)

const advancedAuthClient = withStoryActions(
  {
    device,
    emailOtp: {
      sendVerificationOtp: () => Promise.resolve({ data: null, error: null })
    },
    getSession: () => Promise.resolve({ data: storySession, error: null }),
    phoneNumber: {
      sendOtp: () => Promise.resolve({ data: null, error: null }),
      verify: () => Promise.resolve({ data: storySession, error: null })
    },
    signIn: {
      anonymous: () => Promise.resolve({ data: storySession, error: null }),
      emailOtp: () => Promise.resolve({ data: storySession, error: null }),
      phoneNumber: () => Promise.resolve({ data: storySession, error: null }),
      social: () => Promise.resolve({ data: null, error: null })
    },
    sso: {
      register: () =>
        Promise.resolve({
          data: { id: "sso_storybook", providerId: "acme" },
          error: null
        })
    },
    twoFactor: {
      disable: () => Promise.resolve({ data: null, error: null }),
      enable: () => Promise.resolve({ data: null, error: null }),
      generateBackupCodes: () => Promise.resolve({ data: [], error: null }),
      getTotpUri: () => Promise.resolve({ data: null, error: null }),
      sendOtp: () => Promise.resolve({ data: null, error: null }),
      verifyBackupCode: () => Promise.resolve({ data: null, error: null }),
      verifyOtp: () => Promise.resolve({ data: null, error: null }),
      verifyTotp: () => Promise.resolve({ data: null, error: null })
    }
  },
  "authClient"
) as never

function createStoryQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Number.POSITIVE_INFINITY
      }
    }
  })

  queryClient.setQueryData(authQueryKeys.session, storySession)
  return queryClient
}

function AdvancedPreview(props: {
  children: JSX.Element
  plugins: NonNullable<AuthProviderProps["plugins"]>
  width?: "max-w-md" | "max-w-xl" | "max-w-2xl"
}) {
  return (
    <AuthProvider
      authClient={advancedAuthClient}
      navigate={() => undefined}
      plugins={props.plugins}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      {() => (
        <main class="flex min-h-screen w-full items-center justify-center bg-background p-6 text-foreground">
          <div class={`w-full ${props.width ?? "max-w-xl"}`}>
            {props.children}
          </div>
        </main>
      )}
    </AuthProvider>
  )
}

const meta = {
  id: "zaidan-plugins-advanced-flows",
  title: "Zaidan/Plugins/Advanced authentication",
  args: {
    backupCodes: ["4F8H-2K9M", "7Q3P-6W1N", "9C5R-8T2V", "3L7D-1X6B"],
    defaultOrganizationId: "org_acme_storybook"
  },
  argTypes: {
    backupCodes: { control: "object" },
    defaultOrganizationId: { control: "text" }
  },
  parameters: { layout: "fullscreen" }
} satisfies Meta<{
  backupCodes?: string[]
  defaultOrganizationId?: string
}>

export default meta

type Story = StoryObj<{
  backupCodes?: string[]
  defaultOrganizationId?: string
}>

export const AnonymousPreview: Story = {
  play: storyRenders,
  name: "Anonymous sign in",
  render: () => (
    <AdvancedPreview plugins={[anonymousPlugin()]} width="max-w-md">
      <AnonymousButton />
    </AdvancedPreview>
  )
}

export const EmailOtpPreview: Story = {
  play: storyRenders,
  name: "Email OTP",
  render: () => (
    <AdvancedPreview plugins={[emailOtpPlugin()]} width="max-w-md">
      <EmailOtp />
    </AdvancedPreview>
  )
}

export const PhoneNumberPreview: Story = {
  play: async (context) => {
    await storyRenders(context)
    await context.step("show the selected country dial code", async () => {
      await expect(
        context.canvas.getByRole("combobox", { name: "Country or region" })
      ).toHaveTextContent("+1")
    })
  },
  name: "Phone number",
  render: () => (
    <AdvancedPreview plugins={[phoneNumberPlugin()]} width="max-w-md">
      <PhoneNumber />
    </AdvancedPreview>
  )
}

export const DeviceAuthorizationPreview: Story = {
  play: storyRenders,
  name: "Device authorization",
  render: () => (
    <AdvancedPreview plugins={[deviceAuthorizationPlugin()]} width="max-w-md">
      <DeviceAuthorization />
    </AdvancedPreview>
  )
}

export const SsoProviderSetupPreview: Story = {
  play: storyRenders,
  name: "SSO provider setup",
  render: ({ defaultOrganizationId = "org_acme_storybook" }) => (
    <AdvancedPreview plugins={[ssoPlugin()]}>
      <SsoProviderSetup defaultOrganizationId={defaultOrganizationId} />
    </AdvancedPreview>
  )
}

export const TwoFactorSettingsPreview: Story = {
  play: storyRenders,
  name: "Two-factor settings",
  render: () => (
    <AdvancedPreview plugins={[twoFactorPlugin()]}>
      <TwoFactorSettings />
    </AdvancedPreview>
  )
}

export const BackupCodesPreview: Story = {
  play: storyRenders,
  name: "Backup codes",
  render: ({
    backupCodes = ["4F8H-2K9M", "7Q3P-6W1N", "9C5R-8T2V", "3L7D-1X6B"]
  }) => (
    <AdvancedPreview plugins={[twoFactorPlugin()]}>
      <BackupCodes codes={backupCodes} />
    </AdvancedPreview>
  )
}
