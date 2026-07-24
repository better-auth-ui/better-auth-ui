import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/solid-router"
import type { JSX } from "solid-js"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { Auth } from "@/components/auth/auth"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ForgotPassword } from "@/components/auth/forgot-password"
import { ResetPassword } from "@/components/auth/reset-password"
import { SignIn } from "@/components/auth/sign-in"
import { SignOut } from "@/components/auth/sign-out"
import { SignUp } from "@/components/auth/sign-up"
import { VerifyEmail } from "@/components/auth/verify-email"

const mockAuthClient = {
  requestPasswordReset: async () => ({ data: null, error: null }),
  resetPassword: async () => ({ data: null, error: null }),
  sendVerificationEmail: async () => ({ data: null, error: null }),
  signIn: {
    email: async () => ({ data: null, error: null }),
    social: async () => ({ data: null, error: null }),
    username: async () => ({ data: null, error: null })
  },
  signOut: async () => ({ data: null, error: null }),
  signUp: {
    email: async () => ({ data: null, error: null })
  }
} as never

function AuthStoryProvider(props: { children: () => JSX.Element }) {
  return (
    <AuthProvider
      authClient={mockAuthClient}
      navigate={() => undefined}
      redirectTo="/settings/account"
      socialProviders={["github", "google"]}
    >
      {props.children}
    </AuthProvider>
  )
}

function AuthPreviewShell(props: { children: JSX.Element }) {
  return (
    <main class="flex h-screen min-h-0 w-full items-center justify-center overflow-hidden bg-background p-6 text-foreground">
      {props.children}
    </main>
  )
}

function createAuthRouter(component: () => JSX.Element) {
  const rootRoute = createRootRoute({ component })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component
  })
  const authRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/$path",
    component
  })
  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings/$path",
    component
  })

  return createRouter({
    history: createMemoryHistory({ initialEntries: ["/"] }),
    routeTree: rootRoute.addChildren([indexRoute, authRoute, settingsRoute])
  })
}

function AuthPreviewStory(props: { children: JSX.Element }) {
  return (
    <RouterProvider
      router={createAuthRouter(() => (
        <AuthStoryProvider>
          {() => <AuthPreviewShell>{props.children}</AuthPreviewShell>}
        </AuthStoryProvider>
      ))}
    />
  )
}

const meta = {
  title: "Zaidan/Components/Auth",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const AuthPreview: Story = {
  render: () => (
    <AuthPreviewStory>
      <Auth view="signIn" />
    </AuthPreviewStory>
  )
}

export const SignInPreview: Story = {
  render: () => (
    <AuthPreviewStory>
      <SignIn />
    </AuthPreviewStory>
  )
}

export const SignUpPreview: Story = {
  render: () => (
    <AuthPreviewStory>
      <SignUp />
    </AuthPreviewStory>
  )
}

export const ForgotPasswordPreview: Story = {
  render: () => (
    <AuthPreviewStory>
      <ForgotPassword redirectTo="/auth/reset-password" />
    </AuthPreviewStory>
  )
}

export const ResetPasswordPreview: Story = {
  render: () => (
    <AuthPreviewStory>
      <ResetPassword />
    </AuthPreviewStory>
  )
}

export const SignOutPreview: Story = {
  render: () => (
    <AuthPreviewStory>
      <SignOut />
    </AuthPreviewStory>
  )
}

export const VerifyEmailPreview: Story = {
  render: () => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("better-auth-ui.verify-email", "user@gmail.com")
    }

    return (
      <AuthPreviewStory>
        <VerifyEmail />
      </AuthPreviewStory>
    )
  }
}
