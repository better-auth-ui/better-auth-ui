import type { PasskeyAuthClient } from "@better-auth-ui/core/plugins/passkey"
import { createSignal, type JSX } from "solid-js"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { AuthProvider } from "@/components/auth/auth-provider"
import { OrganizationViewSkeleton } from "@/components/auth/organization/organization-view-skeleton"
import { OtpField } from "@/components/auth/otp-field"
import { PasskeyButton } from "@/components/auth/passkey/passkey-button"
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter"
import {
  ProviderButtons,
  type SocialLayout
} from "@/components/auth/provider-buttons"
import {
  RESET_LINK_SENT_STORAGE_KEY,
  ResetLinkSent
} from "@/components/auth/reset-link-sent"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { storyRenders, withStoryActions } from "../support/story-coverage"

const mockAuthClient = withStoryActions(
  {
    signIn: {
      passkey: async () => ({ data: null, error: null }),
      social: async () => ({ data: null, error: null })
    }
  },
  "authClient"
) as unknown as PasskeyAuthClient

function ComponentPreview(props: {
  children: () => JSX.Element
  passkey?: boolean
}) {
  return (
    <AuthProvider
      authClient={mockAuthClient}
      plugins={props.passkey ? [passkeyPlugin()] : []}
      redirectTo="/settings/account"
      socialProviders={["github", "google", "discord", "microsoft"]}
    >
      {() => (
        <main class="flex min-h-[420px] w-full items-center justify-center bg-background p-6 text-foreground">
          <div class="w-full max-w-md">{props.children()}</div>
        </main>
      )}
    </AuthProvider>
  )
}

function OtpPreview(props: { codeLength: number; errorMessage?: string }) {
  const [value, setValue] = createSignal("")

  return (
    <ComponentPreview>
      {() => (
        <OtpField
          errorMessage={props.errorMessage}
          label="Verification code"
          length={props.codeLength}
          value={value()}
          onInput={setValue}
        />
      )}
    </ComponentPreview>
  )
}

type ComponentStateArgs = {
  codeLength: number
  errorMessage?: string
  password: string
  socialLayout: SocialLayout
}

const meta = {
  id: "zaidan-components-states",
  title: "Zaidan/Components/Component states",
  args: {
    codeLength: 6,
    errorMessage: "",
    password: "Tr0ub4dor&3",
    socialLayout: "grid"
  },
  argTypes: {
    codeLength: { control: { min: 4, max: 8, step: 1, type: "number" } },
    errorMessage: { control: "text" },
    password: { control: "text" },
    socialLayout: {
      control: "inline-radio",
      options: ["auto", "vertical", "horizontal", "grid"]
    }
  },
  parameters: { layout: "fullscreen" }
} satisfies Meta<ComponentStateArgs>

export default meta

type Story = StoryObj<ComponentStateArgs>

export const ProviderLayoutsPreview: Story = {
  name: "Provider button layouts",
  render: ({ socialLayout }) => (
    <ComponentPreview>
      {() => <ProviderButtons socialLayout={socialLayout} />}
    </ComponentPreview>
  ),
  play: storyRenders
}

export const PasswordStrengthPreview: Story = {
  name: "Password strength",
  render: ({ password }) => (
    <ComponentPreview>
      {() => <PasswordStrengthMeter password={password} />}
    </ComponentPreview>
  ),
  play: storyRenders
}

export const OtpFieldPreview: Story = {
  name: "OTP field",
  render: ({ codeLength, errorMessage }) => (
    <OtpPreview codeLength={codeLength} errorMessage={errorMessage} />
  ),
  play: storyRenders
}

export const ResetLinkSentPreview: Story = {
  name: "Reset link sent",
  render: () => {
    sessionStorage.setItem(RESET_LINK_SENT_STORAGE_KEY, "ada@gmail.com")

    return <ComponentPreview>{() => <ResetLinkSent />}</ComponentPreview>
  },
  play: storyRenders
}

export const PasskeyButtonPreview: Story = {
  name: "Passkey button",
  render: () => (
    <ComponentPreview passkey>
      {() => <PasskeyButton view="signIn" />}
    </ComponentPreview>
  ),
  play: storyRenders
}

export const OrganizationLoadingPreview: Story = {
  name: "Organization loading",
  render: () => (
    <ComponentPreview>
      {() => (
        <section aria-label="Loading organization" class="flex flex-col gap-6">
          <OrganizationViewSkeleton size="sm" />
          <OrganizationViewSkeleton />
          <OrganizationViewSkeleton hideSlug size="lg" />
        </section>
      )}
    </ComponentPreview>
  ),
  play: storyRenders
}
