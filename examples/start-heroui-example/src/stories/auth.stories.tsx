import {
  Auth,
  AuthProvider,
  ForgotPassword,
  ResetPassword,
  SignIn,
  SignOut,
  SignUp,
  VerifyEmail
} from "@better-auth-ui/heroui"
import { Toast } from "@heroui/react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"

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

function AuthPreview({ children }: { children: ReactNode }) {
  return (
    <AuthProvider
      authClient={mockAuthClient}
      navigate={() => undefined}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      <main className="flex min-h-screen w-full items-center justify-center bg-background p-6 text-foreground">
        {children}
      </main>
      <Toast.Provider />
    </AuthProvider>
  )
}

const meta = {
  title: "HeroUI/Components/Auth",
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
