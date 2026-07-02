import { AuthProvider } from "@better-auth-ui/heroui"
import { apiKeyPlugin } from "@better-auth-ui/heroui/plugins/api-key"
import { deleteUserPlugin } from "@better-auth-ui/heroui/plugins/delete-user"
import { magicLinkPlugin } from "@better-auth-ui/heroui/plugins/magic-link"
import { multiSessionPlugin } from "@better-auth-ui/heroui/plugins/multi-session"
import { organizationPlugin } from "@better-auth-ui/heroui/plugins/organization"
import { passkeyPlugin } from "@better-auth-ui/heroui/plugins/passkey"
import { themePlugin } from "@better-auth-ui/heroui/plugins/theme"
import { usernamePlugin } from "@better-auth-ui/heroui/plugins/username"
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
          magicLinkPlugin(),
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
