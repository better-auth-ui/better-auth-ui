import "../global.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { authClient } from "../src/auth-client"

/**
 * Root layout: providers + session-driven routing. `Stack.Protected` swaps
 * between the `(app)` and `(auth)` groups based on the Better Auth session —
 * so after sign-in the app switches automatically, no manual navigation.
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
      <View className="flex-1 items-center justify-center">
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
    </Stack>
  )
}
