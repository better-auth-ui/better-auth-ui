import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider
} from "@tanstack/solid-router"
import type { JSX } from "solid-js"
import { expect, fn, waitFor } from "storybook/test"
import type { Meta, StoryObj } from "storybook-solidjs-vite"
import { Auth } from "@/components/auth/auth"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ForgotPassword } from "@/components/auth/forgot-password"
import { ResetPassword } from "@/components/auth/reset-password"
import { SignIn } from "@/components/auth/sign-in"
import { SignOut } from "@/components/auth/sign-out"
import { SignUp } from "@/components/auth/sign-up"
import { VerifyEmail } from "@/components/auth/verify-email"

type AuthStoryArgs = {
  redirectTo: string
  socialProviders: ("github" | "google")[]
  socialSignInMode: "popup" | "redirect"
}

const authActions = {
  navigate: fn().mockName("navigate"),
  requestPasswordReset: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.requestPasswordReset"
  ),
  resetPassword: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.resetPassword"
  ),
  sendVerificationEmail: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.sendVerificationEmail"
  ),
  signInEmail: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.signIn.email"
  ),
  signInSocial: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.signIn.social"
  ),
  signInUsername: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.signIn.username"
  ),
  signOut: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.signOut"
  ),
  signUpEmail: fn(async () => ({ data: null, error: null })).mockName(
    "authClient.signUp.email"
  )
}

const mockAuthClient = {
  requestPasswordReset: authActions.requestPasswordReset,
  resetPassword: authActions.resetPassword,
  sendVerificationEmail: authActions.sendVerificationEmail,
  signIn: {
    email: authActions.signInEmail,
    social: authActions.signInSocial,
    username: authActions.signInUsername
  },
  signOut: authActions.signOut,
  signUp: { email: authActions.signUpEmail }
} as never

function AuthStoryProvider(
  props: Partial<AuthStoryArgs> & { children: () => JSX.Element }
) {
  return (
    <AuthProvider
      authClient={mockAuthClient}
      navigate={authActions.navigate}
      redirectTo={props.redirectTo ?? "/settings/account"}
      socialProviders={props.socialProviders ?? ["github", "google"]}
      socialSignInMode={props.socialSignInMode ?? "redirect"}
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

function AuthPreviewStory(
  props: Partial<AuthStoryArgs> & { children: JSX.Element }
) {
  return (
    <RouterProvider
      router={createAuthRouter(() => (
        <AuthStoryProvider {...props}>
          {() => <AuthPreviewShell>{props.children}</AuthPreviewShell>}
        </AuthStoryProvider>
      ))}
    />
  )
}

const meta = {
  id: "zaidan-components-auth",
  title: "Zaidan/Components/Authentication",
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

export const AuthPreview: Story = {
  render: (args) => (
    <AuthPreviewStory {...args}>
      <Auth view="signIn" />
    </AuthPreviewStory>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("sign in with email and password", async () => {
      await userEvent.type(
        await canvas.findByRole("textbox", { name: "Email" }),
        "ada@example.com"
      )
      await userEvent.type(
        await canvas.findByLabelText("Password"),
        "storybook-password"
      )
      await userEvent.click(canvas.getByRole("button", { name: "Sign In" }))
      await waitFor(() => expect(authActions.signInEmail).toHaveBeenCalled())
    })
  }
}

export const SignInPreview: Story = {
  render: (args) => (
    <AuthPreviewStory {...args}>
      <SignIn />
    </AuthPreviewStory>
  ),
  play: AuthPreview.play
}

export const SignUpPreview: Story = {
  render: (args) => (
    <AuthPreviewStory {...args}>
      <SignUp />
    </AuthPreviewStory>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("create an account", async () => {
      await userEvent.type(
        await canvas.findByRole("textbox", { name: "Name" }),
        "Ada Lovelace"
      )
      await userEvent.type(
        canvas.getByRole("textbox", { name: "Email" }),
        "ada@example.com"
      )
      await userEvent.type(
        await canvas.findByLabelText("Password"),
        "storybook-password"
      )
      await userEvent.click(canvas.getByRole("button", { name: "Sign Up" }))
      await waitFor(() => expect(authActions.signUpEmail).toHaveBeenCalled())
    })
  }
}

export const ForgotPasswordPreview: Story = {
  render: (args) => (
    <AuthPreviewStory {...args}>
      <ForgotPassword redirectTo="/auth/reset-password" />
    </AuthPreviewStory>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("request a password reset", async () => {
      await userEvent.type(
        await canvas.findByRole("textbox", { name: "Email" }),
        "ada@example.com"
      )
      await userEvent.click(
        canvas.getByRole("button", { name: "Send reset link" })
      )
      await waitFor(() =>
        expect(authActions.requestPasswordReset).toHaveBeenCalled()
      )
    })
  }
}

export const ResetPasswordPreview: Story = {
  render: (args) => (
    <AuthPreviewStory {...args}>
      <ResetPassword />
    </AuthPreviewStory>
  ),
  play: async ({ canvas, step, userEvent }) => {
    await step("set a new password", async () => {
      const password = await canvas.findByLabelText("New password")
      await userEvent.type(password, "new-storybook-password")
      await expect(password).toHaveValue("new-storybook-password")
    })
  }
}

export const SignOutPreview: Story = {
  render: (args) => (
    <AuthPreviewStory {...args}>
      <SignOut />
    </AuthPreviewStory>
  ),
  play: async ({ step }) => {
    await step("sign out the current session", async () => {
      await waitFor(() => expect(authActions.signOut).toHaveBeenCalled())
    })
  }
}

export const VerifyEmailPreview: Story = {
  render: (args) => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("better-auth-ui.verify-email", "user@gmail.com")
    }

    return (
      <AuthPreviewStory {...args}>
        <VerifyEmail />
      </AuthPreviewStory>
    )
  },
  play: async ({ canvas, step }) => {
    await step("show the resend cooldown", async () => {
      await expect(
        await canvas.findByRole("button", { name: /Resend in/ })
      ).toBeDisabled()
    })
  }
}
