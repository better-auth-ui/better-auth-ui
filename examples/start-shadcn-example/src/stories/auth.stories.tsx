import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

import { Auth } from "@/components/auth/auth"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ForgotPassword } from "@/components/auth/forgot-password"
import { ResetPassword } from "@/components/auth/reset-password"
import { SignIn } from "@/components/auth/sign-in"
import { SignOut } from "@/components/auth/sign-out"
import { SignUp } from "@/components/auth/sign-up"
import { VerifyEmail } from "@/components/auth/verify-email"
import { Toaster } from "@/components/ui/sonner"

const mockAuthClient = {
  requestPasswordReset: async () => ({ data: null, error: null }),
  resetPassword: async () => ({ data: null, error: null }),
  sendVerificationEmail: async () => ({ data: null, error: null }),
  signIn: {
    email: async () => ({ data: null, error: null }),
    social: async () => ({ data: null, error: null })
  },
  signOut: async () => ({ data: null, error: null }),
  signUp: {
    email: async () => ({ data: null, error: null })
  }
} as never

type StoryLinkProps = ComponentPropsWithoutRef<"a"> & { to?: string }

function StoryLink({ href, to, ...props }: StoryLinkProps) {
  return <a href={href ?? to} {...props} />
}

function AuthPreview({ children }: { children: ReactNode }) {
  return (
    <AuthProvider
      authClient={mockAuthClient}
      Link={StoryLink}
      navigate={() => undefined}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      <main className="flex min-h-screen w-full items-center justify-center bg-background p-6 text-foreground">
        {children}
      </main>
      <Toaster />
    </AuthProvider>
  )
}

const meta = {
  title: "shadcn/ui/Components/Auth",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const AuthPreviewStory: Story = {
  name: "Auth",
  render: () => (
    <AuthPreview>
      <Auth view="signIn" />
    </AuthPreview>
  )
}

export const SignInPreview: Story = {
  name: "Sign in",
  render: () => (
    <AuthPreview>
      <SignIn />
    </AuthPreview>
  )
}

export const SignUpPreview: Story = {
  name: "Sign up",
  render: () => (
    <AuthPreview>
      <SignUp />
    </AuthPreview>
  )
}

export const ForgotPasswordPreview: Story = {
  name: "Forgot password",
  render: () => (
    <AuthPreview>
      <ForgotPassword />
    </AuthPreview>
  )
}

export const ResetPasswordPreview: Story = {
  name: "Reset password",
  render: () => (
    <AuthPreview>
      <ResetPassword />
    </AuthPreview>
  )
}

export const SignOutPreview: Story = {
  name: "Sign out",
  render: () => (
    <AuthPreview>
      <SignOut />
    </AuthPreview>
  )
}

export const VerifyEmailPreview: Story = {
  name: "Verify email",
  render: () => {
    sessionStorage.setItem("better-auth-ui.verify-email", "ada@example.com")

    return (
      <AuthPreview>
        <VerifyEmail />
      </AuthPreview>
    )
  }
}
