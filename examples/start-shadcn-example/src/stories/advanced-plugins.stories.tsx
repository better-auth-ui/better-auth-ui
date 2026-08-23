import type { AuthPlugin } from "@better-auth-ui/react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { expect, fn, within } from "storybook/test"

import { AnonymousButton } from "@/components/auth/anonymous/anonymous-button"
import { AuthProvider } from "@/components/auth/auth-provider"
import { DeviceAuthorization } from "@/components/auth/device-authorization/device-authorization"
import { EmailOtp } from "@/components/auth/email-otp/email-otp"
import { PhoneNumber } from "@/components/auth/phone-number/phone-number"
import { SsoProviderSetup } from "@/components/auth/sso/sso-provider-setup"
import { BackupCodes } from "@/components/auth/two-factor/backup-codes"
import { TwoFactorSettings } from "@/components/auth/two-factor/two-factor-settings"
import { Toaster } from "@/components/ui/sonner"
import { anonymousPlugin } from "@/lib/auth/anonymous-plugin"
import { deviceAuthorizationPlugin } from "@/lib/auth/device-authorization-plugin"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { phoneNumberPlugin } from "@/lib/auth/phone-number-plugin"
import { ssoPlugin } from "@/lib/auth/sso-plugin"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"

import {
  createStoryQueryClient,
  StoryLink,
  StoryShell,
  storyActions,
  storyAuthClient,
  storySession
} from "./story-fixtures"

const advancedActions = {
  approveDevice: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.device.approve"
  ),
  denyDevice: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.device.deny"
  ),
  registerSso: fn(async () => ({
    data: { id: "sso_storybook", providerId: "acme" },
    error: null
  })).mockName("authClient.sso.register"),
  sendEmailOtp: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.emailOtp.sendVerificationOtp"
  ),
  sendPhoneOtp: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.phoneNumber.sendOtp"
  ),
  signInAnonymous: fn(async () => ({
    data: storySession,
    error: null
  })).mockName("authClient.signIn.anonymous"),
  signInEmailOtp: fn(async () => ({
    data: storySession,
    error: null
  })).mockName("authClient.signIn.emailOtp"),
  signInPhone: fn(async () => ({ data: storySession, error: null })).mockName(
    "authClient.signIn.phoneNumber"
  ),
  verifyPhone: fn(async () => ({ data: storySession, error: null })).mockName(
    "authClient.phoneNumber.verify"
  )
}

const device = Object.assign(
  fn(async () => ({
    data: {
      clientId: "storybook-client",
      deviceCode: "storybook-device",
      scope: "openid profile email",
      status: "pending",
      userCode: "ABCD-EFGH"
    },
    error: null
  })).mockName("authClient.device"),
  {
    approve: advancedActions.approveDevice,
    deny: advancedActions.denyDevice
  }
)

const advancedAuthClient = {
  ...(storyAuthClient as object),
  device,
  emailOtp: {
    sendVerificationOtp: advancedActions.sendEmailOtp
  },
  phoneNumber: {
    sendOtp: advancedActions.sendPhoneOtp,
    verify: advancedActions.verifyPhone
  },
  signIn: {
    ...(storyAuthClient as { signIn: object }).signIn,
    anonymous: advancedActions.signInAnonymous,
    emailOtp: advancedActions.signInEmailOtp,
    phoneNumber: advancedActions.signInPhone
  },
  sso: {
    register: advancedActions.registerSso
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
      Link={StoryLink}
      navigate={storyActions.navigate}
      plugins={plugins}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      <StoryShell width={width}>{children}</StoryShell>
      <Toaster />
    </AuthProvider>
  )
}

const meta = {
  title: "shadcn/ui/Plugins/Advanced flows",
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
  name: "Anonymous sign in",
  render: () => (
    <AdvancedPreview plugins={[anonymousPlugin()]} width="max-w-md">
      <AnonymousButton />
    </AdvancedPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("continue as a guest", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Continue as guest" })
      )
      await expect(advancedActions.signInAnonymous).toHaveBeenCalled()
    })
  }
}

export const EmailOtpPreview: Story = {
  name: "Email OTP",
  render: () => (
    <AdvancedPreview plugins={[emailOtpPlugin()]} width="max-w-md">
      <EmailOtp />
    </AdvancedPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("send an email code", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Email" }),
        "ada@example.com"
      )
      await userEvent.click(canvas.getByRole("button", { name: "Send code" }))
      await expect(advancedActions.sendEmailOtp).toHaveBeenCalled()
    })
  }
}

export const PhoneNumberPreview: Story = {
  name: "Phone number",
  render: () => (
    <AdvancedPreview plugins={[phoneNumberPlugin()]} width="max-w-md">
      <PhoneNumber />
    </AdvancedPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("send a phone code", async () => {
      const phoneNumber = canvas.getByRole("textbox", {
        name: "Phone number"
      })
      await userEvent.type(phoneNumber, "5551234567")
      await expect(phoneNumber).toHaveValue("(555) 123-4567")
    })
  }
}

export const DeviceAuthorizationPreview: Story = {
  name: "Device authorization",
  render: () => (
    <AdvancedPreview plugins={[deviceAuthorizationPlugin()]} width="max-w-md">
      <DeviceAuthorization />
    </AdvancedPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("look up a device authorization", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Device code" }),
        "ABCD-EFGH"
      )
      await userEvent.click(await canvas.findByRole("button", { name: "Deny" }))
      await expect(advancedActions.denyDevice).toHaveBeenCalled()
    })
  }
}

export const SsoProviderSetupPreview: Story = {
  name: "SSO provider setup",
  render: ({ defaultOrganizationId = "org_acme_storybook" }) => (
    <AdvancedPreview plugins={[ssoPlugin()]}>
      <SsoProviderSetup defaultOrganizationId={defaultOrganizationId} />
    </AdvancedPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("register an OIDC provider", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Provider ID" }),
        "acme"
      )
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Email domain" }),
        "example.com"
      )
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Issuer URL" }),
        "https://idp.example.com"
      )
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Client ID" }),
        "storybook-client"
      )
      await userEvent.type(
        canvas.getByLabelText("Client secret"),
        "storybook-secret"
      )
      await userEvent.click(
        canvas.getByRole("button", { name: "Add SSO provider" })
      )
      await expect(advancedActions.registerSso).toHaveBeenCalled()
    })
  }
}

export const TwoFactorSettingsPreview: Story = {
  name: "Two-factor settings",
  render: () => (
    <AdvancedPreview plugins={[twoFactorPlugin()]}>
      <TwoFactorSettings />
    </AdvancedPreview>
  ),
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step("open two-factor enrollment", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Enable two-factor" })
      )
      await expect(
        within(canvasElement.ownerDocument.body).getByRole("dialog")
      ).toBeVisible()
    })
  }
}

export const BackupCodesPreview: Story = {
  name: "Backup codes",
  render: ({
    backupCodes = ["4F8H-2K9M", "7Q3P-6W1N", "9C5R-8T2V", "3L7D-1X6B"]
  }) => (
    <AdvancedPreview plugins={[twoFactorPlugin()]}>
      <BackupCodes codes={backupCodes} />
    </AdvancedPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("copy backup codes", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Copy to clipboard" })
      )
      await expect(canvas.getByText("4F8H-2K9M")).toBeVisible()
    })
  }
}
