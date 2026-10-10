import {
  AuthProvider,
  createExpoRouterNavigation
} from "@better-auth-ui/react-native"
import {
  adminPlugin,
  anonymousPlugin,
  apiKeyPlugin,
  deleteUserPlugin,
  deviceAuthorizationPlugin,
  emailOtpPlugin,
  lastLoginMethodPlugin,
  magicLinkPlugin,
  multiSessionPlugin,
  organizationPlugin,
  phoneNumberPlugin,
  ssoPlugin,
  themePlugin,
  twoFactorPlugin,
  usernamePlugin
} from "@better-auth-ui/react-native/plugins"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  Stack,
  useGlobalSearchParams,
  usePathname,
  useRouter
} from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { authClient } from "../src/auth-client"

// The server must enable matching auth plugins. Keep the provider mounted
// across routes so pending actions survive authentication and verification.
const plugins = [
  adminPlugin(),
  anonymousPlugin(),
  apiKeyPlugin(),
  deleteUserPlugin(),
  deviceAuthorizationPlugin(),
  emailOtpPlugin(),
  lastLoginMethodPlugin(),
  magicLinkPlugin(),
  multiSessionPlugin(),
  organizationPlugin({
    teams: true,
    dynamicAccessControl: {
      enabled: true,
      permissions: {
        organization: {
          label: "Organization",
          actions: { update: "Update", delete: "Delete" }
        },
        member: {
          label: "Members",
          actions: { create: "Invite", update: "Edit", delete: "Remove" }
        },
        invitation: {
          label: "Invitations",
          actions: { create: "Create", cancel: "Cancel" }
        },
        team: {
          label: "Teams",
          actions: { create: "Create", update: "Edit", delete: "Delete" }
        }
      }
    }
  }),
  phoneNumberPlugin(),
  ssoPlugin(),
  themePlugin(),
  twoFactorPlugin(),
  usernamePlugin()
]

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient())
  const router = useRouter()
  const pathname = usePathname()
  const params = useGlobalSearchParams()
  const navigation = createExpoRouterNavigation({ router, pathname, params })
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authClient={authClient}
        queryClient={queryClient}
        navigation={navigation}
        plugins={plugins}
        redirectTo="/"
        baseURL="betterauthuiexpo://"
        socialProviders={["github", "google"]}
      >
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </QueryClientProvider>
  )
}
