import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { ThemeProvider, useTheme } from "next-themes"
import type { ReactNode } from "react"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { deleteUserPlugin } from "@/lib/auth/delete-user-plugin"
import { magicLinkPlugin } from "@/lib/auth/magic-link-plugin"
import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { themePlugin } from "@/lib/auth/theme-plugin"
import { usernamePlugin } from "@/lib/auth/username-plugin"
import { authClient } from "@/lib/auth-client"
import { AuthProvider } from "./auth/auth-provider"
import { Toaster } from "./ui/sonner"

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { slug } = useParams({ strict: false })

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider
        authClient={authClient}
        redirectTo="/settings/account"
        socialProviders={["github"]}
        navigate={navigate}
        plugins={[
          usernamePlugin(),
          magicLinkPlugin(),
          passkeyPlugin(),
          apiKeyPlugin({ organization: true }),
          themePlugin({ useTheme }),
          multiSessionPlugin(),
          deleteUserPlugin(),
          organizationPlugin({
            slug: slug ?? null
          })
        ]}
        Link={({ href, ...props }) => <Link to={href} {...props} />}
      >
        {children}

        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}
