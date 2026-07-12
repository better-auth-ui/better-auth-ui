import { AuthProvider, UserButton } from "@better-auth-ui/react-native"
import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { authClient } from "../../src/auth-client"

/** Protected dashboard, reached automatically once the session is set. */
export default function Dashboard() {
  return (
    <AuthProvider authClient={authClient}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "600" }}>Dashboard</Text>
          <UserButton size="icon" />
        </View>

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24
          }}
        >
          <Text style={{ fontSize: 16, color: "#737373" }}>
            You're signed in 🎉
          </Text>
        </View>
      </SafeAreaView>
    </AuthProvider>
  )
}
