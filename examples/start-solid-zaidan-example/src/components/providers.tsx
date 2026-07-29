import { deleteUserPlugin } from "@better-auth-ui/core/plugins"
import type { AuthLinkProps } from "@better-auth-ui/solid"
import type { QueryClient } from "@tanstack/solid-query"
import {
  Link as RouterLink,
  useNavigate,
  useParams
} from "@tanstack/solid-router"
import type { JSX } from "solid-js"
import { onCleanup, onMount, Show, splitProps } from "solid-js"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { emailOtpPlugin } from "@/lib/auth/email-otp-plugin"
import { magicLinkPlugin } from "@/lib/auth/magic-link-plugin"
import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { themePlugin } from "@/lib/auth/theme-plugin"
import { twoFactorPlugin } from "@/lib/auth/two-factor-plugin"
import { usernamePlugin } from "@/lib/auth/username-plugin"
import { authClient } from "@/lib/auth-client"
import { syncDocumentThemePreference } from "@/lib/theme"

import { AuthProvider } from "./auth/auth-provider"
import { Toaster } from "./ui/sonner"

export type ProvidersProps = {
  children?: JSX.Element | (() => JSX.Element)
  queryClient?: QueryClient
}

const resolveProviderChildren = (children: ProvidersProps["children"]) =>
  typeof children === "function" ? children() : children

function AuthLink(props: AuthLinkProps) {
  const [local, linkProps] = splitProps(props, ["href"])

  return <RouterLink {...linkProps} to={local.href} />
}

export function Providers(props: ProvidersProps) {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const organizationSlug = () => {
    const slug = params().slug

    if (typeof slug === "string" && slug.length > 0) return slug

    return null
  }

  onMount(() => {
    const cleanup = syncDocumentThemePreference()

    onCleanup(cleanup)
  })

  return (
    <Show keyed when={organizationSlug() ?? "personal"}>
      <AuthProvider
        authClient={authClient}
        Link={AuthLink}
        redirectTo="/settings/account"
        navigate={navigate}
        queryClient={props.queryClient}
        socialProviders={["github"]}
        plugins={[
          multiSessionPlugin(),
          apiKeyPlugin({ organization: true }),
          usernamePlugin({
            usernamePrefix: "@",
            localization: { usernamePlaceholder: "username" }
          }),
          magicLinkPlugin(),
          emailOtpPlugin({
            emailVerification: true,
            passwordReset: true,
            changeEmail: true
          }),
          twoFactorPlugin(),
          passkeyPlugin(),
          themePlugin(),
          deleteUserPlugin(),
          organizationPlugin({
            slugPrefix: "@",
            slug: organizationSlug()
          })
        ]}
      >
        {() => (
          <>
            {resolveProviderChildren(props.children)}
            <Toaster />
          </>
        )}
      </AuthProvider>
    </Show>
  )
}
