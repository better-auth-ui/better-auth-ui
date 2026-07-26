import { AuthProvider } from "@better-auth-ui/heroui"
import {
  apiKeyPlugin,
  deleteUserPlugin,
  deviceAuthorizationPlugin,
  emailOtpPlugin,
  magicLinkPlugin,
  multiSessionPlugin,
  organizationPlugin,
  passkeyPlugin,
  themePlugin,
  twoFactorPlugin,
  usernamePlugin
} from "@better-auth-ui/heroui/plugins"
import { Toast } from "@heroui/react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { ThemeProvider, useTheme } from "next-themes"
import type { ReactNode } from "react"
import { authClient } from "@/lib/auth-client"

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { slug } = useParams({ strict: false })

  return (
    <ThemeProvider defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider
        authClient={authClient}
        redirectTo="/settings/account"
        socialProviders={["github"]}
        emailAndPassword={{ requireEmailVerification: false }}
        navigate={navigate}
        plugins={[
          usernamePlugin({
            usernamePrefix: "@",
            localization: { usernamePlaceholder: "username" }
          }),
          deviceAuthorizationPlugin(),
          magicLinkPlugin(),
          emailOtpPlugin({
            emailVerification: true,
            passwordReset: true,
            changeEmail: true
          }),
          twoFactorPlugin(),
          passkeyPlugin(),
          apiKeyPlugin({ organization: true }),
          themePlugin({ useTheme }),
          multiSessionPlugin(),
          deleteUserPlugin(),
          organizationPlugin({
            slugPrefix: "@",
            slug: slug ?? null
          })
        ]}
      >
        {children}

        <Toast.Provider />
      </AuthProvider>
    </ThemeProvider>
  )
}
