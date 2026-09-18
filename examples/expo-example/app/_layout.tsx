import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { authClient } from "../src/auth-client"

/**
 * Root layout: providers + session-driven routing. `Stack.Protected` swaps
 * between the `(app)` and `(auth)` groups based on the Better Auth session.
 *
 * Note: this app uses NO nativewind — `@better-auth-ui/react-native` styles
 * itself with plain RN styles, so there's no babel/metro/tailwind setup.
 */
export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <AuthGate />
    </QueryClientProvider>
  )
}

function AuthGate() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      {/* Always reachable at /showcase — full component surface, no session. */}
      <Stack.Screen name="showcase" />
    </Stack>
  )
}
