import { deleteUserPlugin } from "@better-auth-ui/core/plugins/delete-user"
import type { QueryClient } from "@tanstack/solid-query"
import { useNavigate, useParams } from "@tanstack/solid-router"
import type { JSX } from "solid-js"
import { onCleanup, onMount, Show } from "solid-js"
import { apiKeyPlugin } from "@/lib/auth/api-key-plugin"
import { magicLinkPlugin } from "@/lib/auth/magic-link-plugin"
import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
import { themePlugin } from "@/lib/auth/theme-plugin"
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

export function Providers(props: ProvidersProps) {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const organizationSlug = () => {
    const slug = params()?.slug

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
        redirectTo="/settings/account"
        navigate={navigate}
        queryClient={props.queryClient}
        socialProviders={["github"]}
        plugins={[
          multiSessionPlugin(),
          apiKeyPlugin({ organization: true }),
          usernamePlugin(),
          magicLinkPlugin(),
          passkeyPlugin(),
          themePlugin(),
          deleteUserPlugin(),
          organizationPlugin({ slug: organizationSlug() })
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
