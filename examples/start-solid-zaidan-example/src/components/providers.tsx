import {
  apiKeyPlugin,
  deleteUserPlugin,
  multiSessionPlugin,
  usernamePlugin
} from "@better-auth-ui/core/plugins"
import type { QueryClient } from "@tanstack/solid-query"
import { useNavigate } from "@tanstack/solid-router"
import type { JSX } from "solid-js"
import { onCleanup, onMount } from "solid-js"
import { passkeyPlugin } from "@/lib/auth/passkey-plugin"
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

  onMount(() => {
    const cleanup = syncDocumentThemePreference()

    onCleanup(cleanup)
  })

  return (
    <AuthProvider
      authClient={authClient}
      redirectTo="/settings/account"
      navigate={navigate}
      queryClient={props.queryClient}
      socialProviders={["github"]}
      plugins={[
        multiSessionPlugin(),
        apiKeyPlugin(),
        passkeyPlugin(),
        deleteUserPlugin(),
        usernamePlugin()
      ]}
    >
      {() => (
        <>
          {resolveProviderChildren(props.children)}
          <Toaster />
        </>
      )}
    </AuthProvider>
  )
}
