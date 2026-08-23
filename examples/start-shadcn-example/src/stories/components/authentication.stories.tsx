import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { expect } from "storybook/test"

import { Auth } from "@/components/auth/auth"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ForgotPassword } from "@/components/auth/forgot-password"
import { ResetPassword } from "@/components/auth/reset-password"
import { SignIn } from "@/components/auth/sign-in"
import { SignOut } from "@/components/auth/sign-out"
import { SignUp } from "@/components/auth/sign-up"
import { VerifyEmail } from "@/components/auth/verify-email"
import { Toaster } from "@/components/ui/sonner"

import {
  createStoryQueryClient,
  storyActions,
  storyAuthClient
} from "../support/story-fixtures"

type AuthStoryArgs = {
  redirectTo: string
  socialProviders: ("github" | "google")[]
  socialSignInMode: "popup" | "redirect"
}

type StoryLinkProps = ComponentPropsWithoutRef<"a"> & { to?: string }

function StoryLink({ href, to, ...props }: StoryLinkProps) {
  return <a href={href ?? to} {...props} />
}

function AuthPreview({
  children,
  redirectTo = "/settings/account",
  socialProviders = ["github", "google"],
  socialSignInMode = "redirect"
}: Partial<AuthStoryArgs> & { children: ReactNode }) {
  return (
    <AuthProvider
      authClient={storyAuthClient}
      Link={StoryLink}
      navigate={storyActions.navigate}
      queryClient={createStoryQueryClient()}
      redirectTo={redirectTo}
      socialProviders={socialProviders}
      socialSignInMode={socialSignInMode}
    >
      <main className="flex min-h-screen w-full items-center justify-center bg-background p-6 text-foreground">
        {children}
      </main>
      <Toaster />
    </AuthProvider>
  )
}

const meta = {
  id: "shadcn-ui-components-auth",
  title: "shadcn/Components/Authentication",
  args: {
    redirectTo: "/settings/account",
    socialProviders: ["github", "google"],
    socialSignInMode: "redirect"
  },
  argTypes: {
    redirectTo: { control: "text" },
    socialProviders: { control: "check", options: ["github", "google"] },
    socialSignInMode: {
      control: "inline-radio",
      options: ["redirect", "popup"]
    }
  },
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<AuthStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const AuthPreviewStory: Story = {
  name: "Auth",
  render: (args) => (
    <AuthPreview {...args}>
      <Auth view="signIn" />
    </AuthPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("sign in with email and password", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Email" }),
        "ada@example.com"
      )
      await userEvent.type(
        canvas.getByLabelText("Password"),
        "storybook-password"
      )
      await userEvent.click(canvas.getByRole("button", { name: "Sign In" }))
      await expect(storyActions.signInEmail).toHaveBeenCalled()
    })
  }
}

export const SignInPreview: Story = {
  name: "Sign in",
  render: (args) => (
    <AuthPreview {...args}>
      <SignIn />
    </AuthPreview>
  ),
  play: AuthPreviewStory.play
}

export const SignUpPreview: Story = {
  name: "Sign up",
  render: (args) => (
    <AuthPreview {...args}>
      <SignUp />
    </AuthPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("create an account", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Name" }),
        "Ada Lovelace"
      )
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Email" }),
        "ada@example.com"
      )
      await userEvent.type(
        canvas.getByLabelText("Password"),
        "storybook-password"
      )
      await userEvent.click(canvas.getByRole("button", { name: "Sign Up" }))
      await expect(storyActions.signUpEmail).toHaveBeenCalled()
    })
  }
}

export const ForgotPasswordPreview: Story = {
  name: "Forgot password",
  render: (args) => (
    <AuthPreview {...args}>
      <ForgotPassword />
    </AuthPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("request a password reset", async () => {
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Email" }),
        "ada@example.com"
      )
      await userEvent.click(
        canvas.getByRole("button", { name: "Send reset link" })
      )
      await expect(storyActions.requestPasswordReset).toHaveBeenCalled()
    })
  }
}

export const ResetPasswordPreview: Story = {
  name: "Reset password",
  render: (args) => (
    <AuthPreview {...args}>
      <ResetPassword />
    </AuthPreview>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("set a new password", async () => {
      await userEvent.type(
        canvas.getByLabelText("Password"),
        "new-storybook-password"
      )
      await expect(canvas.getByLabelText("Password")).toHaveValue(
        "new-storybook-password"
      )
    })
  }
}

export const SignOutPreview: Story = {
  name: "Sign out",
  render: (args) => (
    <AuthPreview {...args}>
      <SignOut />
    </AuthPreview>
  ),
  play: async ({ step }) => {
    await step("sign out the current session", async () => {
      await expect(storyActions.signOut).toHaveBeenCalled()
    })
  }
}

export const VerifyEmailPreview: Story = {
  name: "Verify email",
  render: (args) => {
    sessionStorage.setItem("better-auth-ui.verify-email", "ada@example.com")

    return (
      <AuthPreview {...args}>
        <VerifyEmail />
      </AuthPreview>
    )
  },
  play: async ({ canvas, step }) => {
    await step("show the resend cooldown", async () => {
      await expect(
        canvas.getByRole("button", { name: /Resend in/ })
      ).toBeDisabled()
    })
  }
}
