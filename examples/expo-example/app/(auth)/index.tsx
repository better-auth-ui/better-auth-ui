import { Auth, AuthProvider } from "@better-auth-ui/react-native"
import {
  magicLinkPlugin,
  themePlugin
} from "@better-auth-ui/react-native/plugins"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { authClient } from "../../src/auth-client"

/**
 * The whole auth flow on one screen. The app uses plain RN styles (no
 * nativewind); the `@better-auth-ui/react-native` components style themselves.
 */
export default function AuthScreen() {
  return (
    <AuthProvider
      authClient={authClient}
      socialProviders={["github", "google"]}
      plugins={[magicLinkPlugin(), themePlugin()]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24
          }}
        >
          <Auth />
        </View>
      </SafeAreaView>
    </AuthProvider>
  )
}
