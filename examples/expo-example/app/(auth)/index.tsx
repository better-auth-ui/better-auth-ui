import { Auth, AuthProvider } from "@better-auth-ui/react-native"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { authClient } from "../../src/auth-client"

/**
 * The whole auth flow on one screen. With no router wiring, the built-in state
 * adapter switches between sign-in / sign-up / forgot-password / … in place.
 */
export default function AuthScreen() {
  return (
    <AuthProvider
      authClient={authClient}
      socialProviders={["github", "google"]}
    >
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
        <View className="flex-1 items-center justify-center p-6">
          <Auth />
        </View>
      </SafeAreaView>
    </AuthProvider>
  )
}
