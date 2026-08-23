import {
  AuthProvider,
  OtpField,
  PasswordStrengthMeter,
  ProviderButtons,
  RESET_LINK_SENT_STORAGE_KEY,
  ResetLinkSent,
  type SocialLayout
} from "@better-auth-ui/heroui"
import {
  OrganizationViewSkeleton,
  organizationPlugin
} from "@better-auth-ui/heroui/plugins/organization"
import {
  PasskeyButton,
  passkeyPlugin
} from "@better-auth-ui/heroui/plugins/passkey"
import type { AuthPlugin } from "@better-auth-ui/react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { type ReactNode, useState } from "react"
import { expect, fn } from "storybook/test"

import {
  createStoryQueryClient,
  StoryShell,
  storyActions,
  storyAuthClient
} from "./story-fixtures"

const componentActions = {
  completeOtp: fn().mockName("onComplete"),
  signInPasskey: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.signIn.passkey"
  )
}

const componentAuthClient = {
  ...(storyAuthClient as object),
  signIn: {
    ...(storyAuthClient as { signIn: object }).signIn,
    passkey: componentActions.signInPasskey
  }
} as never

function ComponentPreview({
  children,
  plugins = [],
  width = "max-w-md"
}: {
  children: ReactNode
  plugins?: AuthPlugin[]
  width?: "max-w-md" | "max-w-xl" | "max-w-2xl"
}) {
  return (
    <AuthProvider
      authClient={componentAuthClient}
      baseURL="http://localhost:3000"
      navigate={storyActions.navigate}
      plugins={plugins}
      queryClient={createStoryQueryClient()}
      redirectTo="/settings/account"
      socialProviders={["github", "google", "discord", "microsoft"]}
    >
      <StoryShell width={width}>{children}</StoryShell>
    </AuthProvider>
  )
}

function OtpPreview({
  codeLength,
  errorMessage
}: Pick<ComponentStateArgs, "codeLength" | "errorMessage">) {
  const [value, setValue] = useState("")

  return (
    <ComponentPreview>
      <OtpField
        errorMessage={errorMessage}
        label="Verification code"
        length={codeLength}
        value={value}
        onChange={setValue}
        onComplete={componentActions.completeOtp}
      />
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
  title: "HeroUI/Components/States",
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
      <ProviderButtons socialLayout={socialLayout} />
    </ComponentPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("render every configured provider", async () => {
      await expect(canvas.getAllByRole("button")).toHaveLength(4)
      await expect(canvas.getByRole("button", { name: "GitHub" })).toBeVisible()
    })
  }
}

export const PasswordStrengthPreview: Story = {
  name: "Password strength",
  render: ({ password }) => (
    <ComponentPreview>
      <PasswordStrengthMeter password={password} />
    </ComponentPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("announce the password strength", async () => {
      await expect(canvas.getByText(/Password strength:/)).toBeVisible()
    })
  }
}

export const OtpFieldPreview: Story = {
  name: "OTP field",
  render: ({ codeLength, errorMessage }) => (
    <OtpPreview codeLength={codeLength} errorMessage={errorMessage} />
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("complete a verification code", async () => {
      const field = canvas.getByRole("textbox", { name: "Verification code" })
      await userEvent.type(field, "123456")
      await expect(field).toHaveValue("123456")
      await expect(componentActions.completeOtp).toHaveBeenCalledWith("123456")
    })
  }
}

export const ResetLinkSentPreview: Story = {
  name: "Reset link sent",
  render: () => {
    sessionStorage.setItem(RESET_LINK_SENT_STORAGE_KEY, "ada@gmail.com")

    return (
      <ComponentPreview>
        <ResetLinkSent />
      </ComponentPreview>
    )
  },
  play: async ({ canvas, step }) => {
    await step("show the destination inbox", async () => {
      await expect(canvas.getByText(/ada@gmail.com/)).toBeVisible()
      await expect(
        canvas.getByRole("link", { name: /Open Gmail/ })
      ).toBeVisible()
    })
  }
}

export const PasskeyButtonPreview: Story = {
  name: "Passkey button",
  render: () => (
    <ComponentPreview plugins={[passkeyPlugin()]}>
      <PasskeyButton autoFill={false} view="signIn" />
    </ComponentPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("start passkey sign in", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Continue with Passkey" })
      )
      await expect(componentActions.signInPasskey).toHaveBeenCalled()
    })
  }
}

export const OrganizationLoadingPreview: Story = {
  name: "Organization loading",
  render: () => (
    <ComponentPreview plugins={[organizationPlugin({ slug: "acme" })]}>
      <section
        aria-label="Loading organization"
        className="flex flex-col gap-6"
      >
        <OrganizationViewSkeleton size="sm" />
        <OrganizationViewSkeleton />
        <OrganizationViewSkeleton hideSlug size="lg" />
      </section>
    </ComponentPreview>
  ),
  play: async ({ canvas, step }) => {
    await step("render organization placeholders", async () => {
      await expect(
        canvas.getByRole("region", { name: "Loading organization" })
      ).toBeVisible()
    })
  }
}
